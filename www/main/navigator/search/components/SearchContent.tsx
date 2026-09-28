import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ipcRenderer } from 'electron';
import { Virtuoso } from 'react-virtuoso';
import isOnline from 'is-online';

import banidb from '../../../common/constants/banidb';
import { filters, searchShabads, type FilterOption, type SearchResultItem } from '../../utils';
import { retrieveFilterOption } from '../utils';
import { SilenceDetector, createAudioAnalyser } from './silence';

import { classNames } from '../../../common/utils';
import {
  // FilterDropdown, IconButton, InputBox and VoiceWave: old search bar and
  // filters (commented out below).
  SearchResults,
  FilterTag,
} from '../../../common/sttm-ui';
// import { GurmukhiKeyboard } from './GurmukhiKeyboard'; // old search bar's keyboard
import { LibrarySearchBar } from './LibrarySearchBar';
import { useNewShabad } from '../hooks/use-new-shabad';
import { useRunSearch } from '../hooks/use-run-search';
import {
  setCurrentWriter,
  setCurrentRaag,
  setCurrentSource,
  setSearchQuery,
  setShortcuts,
  setSearchShabadsCount,
  setSearchData,
  setCurrentSearchType,
  setCurrentLanguage,
} from '../../../common/store/redux/navigatorSlice';
import prodConfig from '../../../../../config.prod.json';
import { analytics, i18n } from '../../../common/main-app';
import { onFromMain, sendToMain } from '../../../common/ipc';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import type { LegacyVerse, RealmRow } from '../../../banidb/sqlite-search';
import type { PaneSlotProps } from '../../../common/sttm-ui/pane/Pane';

/** The transcription API's reply to a voice search. */
type TranscriptResponse = {
  status: string;
  message?: string;
  transcriptInitials: { ascii: string };
};

const SearchContent = ({ className }: PaneSlotProps) => {
  const changeActiveShabad = useNewShabad();

  const {
    currentLanguage,
    searchData,
    currentWriter,
    currentRaag,
    currentSource,
    searchQuery,
    currentSearchType,
    shortcuts,
    searchShabadsCount,
  } = useAppSelector((state) => state.navigator);
  const dispatch = useAppDispatch();

  // Local State
  const [databaseProgress, setDatabaseProgress] = useState(1);
  useRunSearch(databaseProgress);
  const [query, setQuery] = useState('');
  const [writerArray, setWriterArray] = useState<FilterOption[]>([]);
  const [raagArray, setRaagArray] = useState<FilterOption[]>([]);
  const [sourceArray, setSourceArray] = useState<FilterOption[]>([]);
  const [searchResultsCount, setSearchResultsCount] = useState(40);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [searchPending, setSearchPending] = useState(true);
  const [microphonePermissionStatus, setMicrophonePermissionStatus] = useState('unknown');

  let loadMoreTimeout: ReturnType<typeof setTimeout> | null = null;

  const sourcesObj = banidb.SOURCE_TEXTS;
  const writersObj = banidb.WRITER_TEXTS;
  const raagsObj = banidb.RAAG_TEXTS;

  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceDetectorRef = useRef<SilenceDetector | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[] | null>(null);

  const isShowFiltersTag =
    currentWriter !== 'all' || currentRaag !== 'all' || currentSource !== 'all';
  // Gurmukhi Keyboard of the old search bar (commented out below).
  // const [keyboardOpenStatus, setKeyboardOpenStatus] = useState(false);
  // const HandleKeyboardToggle = () => {
  //   setKeyboardOpenStatus(!keyboardOpenStatus);
  //   analytics.trackEvent({
  //     category: 'search',
  //     action: 'gurmukhi-keyboard-open',
  //     value: keyboardOpenStatus ? 'open' : 'close',
  //   });
  // };

  const loadMoreSearchResults = useCallback(() => {
    if (searchPending) {
      setSearchPending(false);
      if (loadMoreTimeout) {
        clearTimeout(loadMoreTimeout);
      }
      loadMoreTimeout = setTimeout(() => {
        setSearchResultsCount(searchResultsCount + 20);
        searchShabads(query, currentSearchType, currentSource, searchResultsCount).then((rows) => {
          if (searchData.length < rows!.length) {
            setSearchPending(true);
            analytics.trackEvent({
              category: 'search',
              action: 'load-more-search-results',
              value: rows!.length,
            });
          }
          return query && rows!.length && dispatch(setSearchData(rows!));
        });
      }, 200);
    }
  }, [searchPending, searchData, currentSearchType, currentSource, query, searchResultsCount]);

  // The DB's English names are typed nullable; they're read as set, as before.
  const mapVerseItems = (searchedShabadsArray: RealmRow<LegacyVerse>[]): SearchResultItem[] =>
    searchedShabadsArray
      ? searchedShabadsArray.map((verse) => ({
          ang: verse.PageNo,
          raag: verse.Raag ? (verse.Raag.RaagEnglish as string) : '',
          shabadId: verse.Shabads[0].ShabadID,
          source: verse.Source ? (verse.Source.SourceEnglish as string) : '',
          sourceId: verse.Source ? verse.Source.SourceID : '',
          verse: verse.Gurmukhi,
          verseId: verse.ID,
          writer: verse.Writer ? (verse.Writer.WriterEnglish as string) : '',
        }))
      : [];

  const [filteredShabads, setFilteredShabads] = useState<SearchResultItem[]>([]);

  const openFirstResult = () => {
    if (searchQuery.length > 0 && filteredShabads.length > 0) {
      // Takes { shabadId, verseId, verse } from the first shabad in search result
      const { shabadId, verseId, verse } = filteredShabads[0];
      changeActiveShabad(shabadId, verseId, verse);
    }
    analytics.trackEvent({
      category: 'search',
      action: 'open-first-result',
      value: searchQuery,
    });
  };

  const getPlaceholder = () => {
    if (databaseProgress < 1) {
      return i18n.t('DATABASE.DOWNLOADING');
    }
    if (currentSearchType === 3) {
      return i18n.t('SEARCH.PLACEHOLDER_ENGLISH');
    }
    return i18n.t('SEARCH.PLACEHOLDER_GURMUKHI');
  };

  useEffect(() => {
    setSearchPending(true);
    setFilteredShabads(
      filters(
        mapVerseItems(searchData),
        currentWriter,
        currentRaag,
        currentSource,
        writerArray,
        raagArray,
      ),
    );
  }, [searchData, currentWriter, currentRaag, currentSource]);

  // checks if keyboard shortcut is fired then it invokes the function
  useEffect(() => {
    if (shortcuts.openFirstResult) {
      openFirstResult();
      dispatch(
        setShortcuts({
          ...shortcuts,
          openFirstResult: false,
        }),
      );
    }
  }, [shortcuts]);

  useEffect(() => {
    if (searchQuery.length === 0) {
      setFilteredShabads([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchShabadsCount !== filteredShabads.length) {
      dispatch(setSearchShabadsCount(filteredShabads.length));
    }
  }, [filteredShabads]);

  // desktop_scripts emits this in this window (ipcRenderer.emit), so the JSON
  // comes first, with no event.
  onFromMain('database-progress', (data: unknown) => {
    const { percent } = JSON.parse(data as string);
    setDatabaseProgress(percent);
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== searchQuery) {
        dispatch(setSearchQuery(query));
        setSearchResultsCount(40);
      }
    }, 50);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    const wData = retrieveFilterOption(writersObj, 'writer');
    wData.then((d) => {
      setWriterArray(d);
    });
    const rData = retrieveFilterOption(raagsObj, 'raag');
    rData.then((d) => {
      setRaagArray(d);
    });
    const sData = retrieveFilterOption(sourcesObj, 'source');
    sData.then((d) => {
      setSourceArray(d);
    });
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      sendToMain('get-media-access-status', 'microphone');
      const permission = await navigator.permissions.query({ name: 'microphone' });
      return permission.state;
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return 'unknown';
    }
  };

  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        const onlineValue = await isOnline();
        setIsConnected(onlineValue);
      } catch {
        setIsConnected(false);
      }
    };

    checkOnlineStatus();
    checkMicrophonePermission();
  }, []);

  const requestMicrophonePermission = () =>
    new Promise<string>((resolve) => {
      const handlePermissionResponse = (event: Electron.IpcRendererEvent, status: string) => {
        ipcRenderer.removeListener('media-access-status', handlePermissionResponse);
        resolve(status);
      };

      ipcRenderer.on('media-access-status', handlePermissionResponse);
      sendToMain('get-media-access-status', 'microphone');
    });

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current || mediaRecorder;

    if (recorder && recorder.state !== 'inactive') {
      if (recorder.state === 'recording') {
        recorder.requestData();
      }
      recorder.stop();
    }

    if (silenceDetectorRef.current) {
      silenceDetectorRef.current.stop();
      silenceDetectorRef.current.destroy();
      silenceDetectorRef.current = null;
    }

    setIsRecording(false);
    setAudioStream(null);

    analytics.trackEvent({
      category: 'search',
      action: 'voice-search',
      label: 'stop-recording',
    });
  };

  const startRecording = async () => {
    try {
      const permissionStatus = await requestMicrophonePermission();
      setMicrophonePermissionStatus(permissionStatus);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current = recorder;
      recordingChunksRef.current = chunks;

      setAudioStream(stream);

      const { audioContext, analyser } = createAudioAnalyser(stream);
      audioContextRef.current = audioContext;

      const silenceDetector = new SilenceDetector(
        analyser,
        {
          onSilenceDetected: () => {
            stopRecording();
          },
        },
        {
          threshold: 0.03,
          durationMs: 1500,
        },
      );
      silenceDetectorRef.current = silenceDetector;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
          recordingChunksRef.current = chunks;
        }
      };

      recorder.onstop = async () => {
        const finalChunks = recordingChunksRef.current || chunks;

        if (!finalChunks || finalChunks.length === 0) {
          console.warn('No audio data collected');
          setIsTranscriptLoading(false);
          setAudioStream(null);
          mediaRecorderRef.current = null;
          recordingChunksRef.current = null;
          return;
        }

        const audioBlob = new Blob(finalChunks, { type: 'audio/wav' });
        const reader = new FileReader();

        setIsTranscriptLoading(true);

        reader.onload = async () => {
          const base64Audio = reader.result!.toString().split(',')[1];

          try {
            const response = await fetch(prodConfig.AUDIO_TRANSCRIPT_API, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audioData: base64Audio,
                apiKey: prodConfig.AUDIO_TRANSCRIPT_API_KEY,
              }),
            });

            const data = (await response.json()) as TranscriptResponse;

            if (data.status === 'success') {
              const decodedText = data.transcriptInitials.ascii;
              if (currentSearchType !== 1) {
                dispatch(setCurrentSearchType(1));
              }
              if (currentLanguage !== 'gr') {
                dispatch(setCurrentLanguage('gr'));
              }
              setQuery(decodedText);
              analytics.trackEvent({
                category: 'search',
                action: 'voice-search',
                label: 'transcript-success',
                value: data.transcriptInitials,
              });
            } else {
              console.error('Error:', data.message);
              analytics.trackEvent({
                category: 'search',
                action: 'voice-search',
                label: 'transcript-error',
                value: data.message,
              });
            }

            setIsTranscriptLoading(false);
          } catch (error) {
            console.error('Network Error:', (error as Error).message);
            analytics.trackEvent({
              category: 'search',
              action: 'voice-search',
              label: 'network-error',
              value: (error as Error).message,
            });

            setIsTranscriptLoading(false);
          }
        };

        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);

        mediaRecorderRef.current = null;
        recordingChunksRef.current = null;
      };

      setMediaRecorder(recorder);
      recorder.start();
      silenceDetector.start();
      setIsRecording(true);

      analytics.trackEvent({
        category: 'search',
        action: 'voice-search',
        label: 'start-recording',
      });
    } catch (error) {
      const { name, message } = error as Error;
      const errorMessage = i18n.t(`MICROPHONE_ERROR.${name}`) || i18n.t('MICROPHONE_ERROR.default');

      analytics.trackEvent({
        category: 'search',
        action: 'voice-search',
        label: name,
        value: message,
      });

      // eslint-disable-next-line no-alert
      alert(errorMessage);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(
    () => () => {
      if (silenceDetectorRef.current) {
        silenceDetectorRef.current.destroy();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    },
    [],
  );

  return (
    <div className={classNames(className, 'search-pane__body')}>
      <LibrarySearchBar
        query={query}
        setQuery={setQuery}
        placeholder={getPlaceholder()}
        disabled={databaseProgress < 1}
        writerArray={writerArray}
        raagArray={raagArray}
        sourceArray={sourceArray}
        onMicClick={isConnected ? handleMicClick : undefined}
        isRecording={isRecording}
        isProcessing={isTranscriptLoading}
        stream={audioStream}
        isMicDenied={microphonePermissionStatus === 'denied'}
      />
      {/* Old search bar, replaced by LibrarySearchBar above; kept for comparison.
      <div className="search-content">
        {(() => {
          if (isRecording && audioStream) {
            return (
              <div className="waveform-container">
                <VoiceWave
                  stream={audioStream}
                  isRecording={isRecording}
                  handleMicClick={handleMicClick}
                  width={200}
                  height={30}
                  barColor="#007bff"
                />
              </div>
            );
          }

          if (isTranscriptLoading) {
            return (
              <input
                className="input-box"
                type="search"
                placeholder="⏳ Processing audio..."
                disabled={true}
                readOnly
              />
            );
          }

          return (
            <InputBox
              placeholder={getPlaceholder()}
              disabled={databaseProgress < 1}
              className={`${currentLanguage === 'gr' ? 'gurmukhi' : 'english'} mousetrap`}
              databaseProgress={databaseProgress}
              query={query}
              setQuery={setQuery}
            />
          );
        })()}
        <div className="input-buttons">
          {isConnected && (
            <IconButton
              icon={isRecording ? 'stop' : 'microphone'}
              onClick={handleMicClick}
              style={{
                opacity: microphonePermissionStatus === 'denied' ? 0.5 : 1,
                cursor: microphonePermissionStatus === 'denied' ? 'not-allowed' : 'pointer',
              }}
            />
          )}
          {currentLanguage !== 'en' && (
            <IconButton icon="keyboard" onClick={HandleKeyboardToggle} />
          )}
        </div>
      </div>
      */}
      <div className="search-pane__download">
        <div
          className="search-pane__download-progress"
          style={{
            width: `${databaseProgress * 100}%`,
            height: databaseProgress < 1 ? '2px' : '0px',
          }}
        ></div>
      </div>
      {/* The old search bar's keyboard (LibrarySearchBar has its own).
      {keyboardOpenStatus && currentLanguage !== 'en' && (
        <GurmukhiKeyboard searchType={currentSearchType} query={query} setQuery={setQuery} />
      )}
      */}
      <div className="search-pane__filter-tags">
        {isShowFiltersTag && (
          <div className="filter-tag--container">
            {currentWriter !== 'all' && (
              <FilterTag
                close={() => {
                  dispatch(setCurrentWriter('all'));
                  analytics.trackEvent({
                    category: 'search',
                    action: 'remove-filter',
                    label: 'writer',
                    value: currentWriter,
                  });
                }}
                title={currentWriter}
                filterType={i18n.t('SEARCH.WRITER')}
              />
            )}
            {currentRaag !== 'all' && (
              <FilterTag
                close={() => {
                  dispatch(setCurrentRaag('all'));
                  analytics.trackEvent({
                    category: 'search',
                    action: 'remove-filter',
                    label: 'raag',
                    value: currentRaag,
                  });
                }}
                title={currentRaag}
                filterType={i18n.t('SEARCH.RAAG')}
              />
            )}
            {currentSource !== 'all' && (
              <FilterTag
                close={() => {
                  dispatch(setCurrentSource('all'));
                  analytics.trackEvent({
                    category: 'search',
                    action: 'remove-filter',
                    label: 'source',
                    value: currentSource,
                  });
                }}
                title={i18n.t(`SEARCH.SOURCES.${sourcesObj[currentSource]}.TEXT`)}
                filterType={i18n.t('SEARCH.SOURCE')}
              />
            )}
          </div>
        )}
        {/* Old filter dropdowns; LibrarySearchBar shows source, writer and raag.
        <div className="filters">
          <span className="filters-label">Filter by </span>
          <FilterDropdown
            title="Writer"
            onChange={(event) => {
              dispatch(setCurrentWriter(event.target.value));
              analytics.trackEvent({
                category: 'search',
                action: 'set-filter',
                label: 'writer',
                value: event.target.value,
              });
            }}
            optionsArray={writerArray}
            currentValue={currentWriter}
          />
          <FilterDropdown
            title="Raag"
            onChange={(event) => {
              dispatch(setCurrentRaag(event.target.value));
              analytics.trackEvent({
                category: 'search',
                action: 'set-filter',
                label: 'raag',
                value: event.target.value,
              });
            }}
            optionsArray={raagArray}
            currentValue={currentRaag}
          />
          <FilterDropdown
            title="Source"
            onChange={(event) => {
              dispatch(setCurrentSource(event.target.value));
              analytics.trackEvent({
                category: 'search',
                action: 'set-filter',
                label: 'source',
                value: event.target.value,
              });
            }}
            optionsArray={sourceArray}
            currentValue={currentSource}
          />
        </div>
        */}
      </div>
      <div
        className={classNames(
          'search-pane__results',
          isShowFiltersTag && 'search-pane__results--filtered',
        )}
      >
        <div className="verse-list">
          <Virtuoso
            data={filteredShabads}
            overscan={200}
            endReached={loadMoreSearchResults}
            itemContent={(index, { ang, shabadId, sourceId, verse, verseId, writer, raag }) => (
              <SearchResults
                key={index}
                ang={ang}
                searchType={currentSearchType}
                onClick={changeActiveShabad}
                shabadId={shabadId}
                raag={raag}
                sourceId={sourceId}
                searchQuery={searchQuery}
                verse={verse}
                verseId={verseId}
                writer={writer}
                currentLanguage={currentLanguage}
              />
            )}
          ></Virtuoso>
        </div>
      </div>
    </div>
  );
};

export default SearchContent;
