import React, { useState, useEffect } from 'react';
import anvaad from 'anvaad-js';
import { ButtonCard, CloseButton, Dialog } from '@khalisfoundation/sikhi-ui';
import insertSlide from '../../../common/constants/slidedb';
import {
  setIsMiscSlide,
  setMiscSlideText,
  setIsAnnouncement,
  setShortcuts,
  setIsMiscSlideGurmukhi,
} from '../../../common/store/redux/navigatorSlice';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import { analytics, i18n } from '../../../common/main-app';
import { sendToMain } from '../../../common/ipc';

const { gurus } = insertSlide.dropdownStrings;

type DhanGuruProps = {
  isGurmukhi: boolean;
};

export const DhanGuru = ({ isGurmukhi }: DhanGuruProps) => {
  const { isMiscSlide, miscSlideText, isAnnouncement, isMiscSlideGurmukhi, shortcuts } =
    useAppSelector((state) => state.navigator);
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setCurrentDhanGuruIndex] = useState<number | null>(null);

  const addMiscSlide = (givenText: string) => {
    if (!isMiscSlide) {
      dispatch(setIsMiscSlide(true));
    }
    if (miscSlideText !== givenText) {
      dispatch(setMiscSlideText(givenText));
    }
  };

  const addDhanGuruSlide = (e: string | { target: { value: string } }) => {
    if (!isAnnouncement) {
      dispatch(setIsAnnouncement(true));
    }
    if (typeof e === 'object') {
      addMiscSlide(e.target.value);
      analytics.trackEvent({
        category: 'display',
        action: 'dhanguru-slide',
        label: 'Dhan guru slide',
        value: e.target.value,
      });
    } else {
      addMiscSlide(e);
      analytics.trackEvent({
        category: 'display',
        action: 'dhanguru-slide',
        label: 'Dhan guru slide',
        value: e,
      });
    }
  };

  // The shortcut's picker: pick a Guru for their Dhan Guru slide, in the
  // language of the slide showing.
  const pickFromModal = (index: number) => {
    addDhanGuruSlide(
      insertSlide.slideStrings.dhanguruStrings[index][isMiscSlideGurmukhi ? 'gurmukhi' : 'english'],
    );
    setCurrentDhanGuruIndex(index);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  const getGuruIndex = (index: number) => {
    if (index < 9) {
      return `0${index + 1}`;
    }
    return `${index + 1}`;
  };

  const insertDhanGuru = (index: number) => {
    const { english, gurmukhi } = insertSlide.slideStrings.dhanguruStrings[index];
    setCurrentDhanGuruIndex(index);
    if (isGurmukhi !== isMiscSlideGurmukhi) {
      dispatch(setIsMiscSlideGurmukhi(isGurmukhi));
    }
    if (isGurmukhi) {
      addDhanGuruSlide(gurmukhi);
    } else {
      addDhanGuruSlide(english);
    }
  };

  useEffect(() => {
    if (shortcuts.openDhanGuruSlide) {
      setIsModalOpen(true);
      dispatch(
        setShortcuts({
          ...shortcuts,
          openDhanGuruSlide: false,
        }),
      );
    }
  }, [shortcuts]);

  useEffect(() => {
    if (isMiscSlide) {
      sendToMain('show-misc-text', {
        text: miscSlideText,
        isGurmukhi: isMiscSlideGurmukhi,
        isAnnouncement,
      });
    }
  }, [miscSlideText, isMiscSlide, isMiscSlideGurmukhi, isAnnouncement]);

  return (
    <section className="settings-group">
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variant="gradient"
        className="app-dialog dhan-guru-dialog"
        headerLeft={<h2 className="app-dialog__title">{i18n.t('INSERT.INSERT_DHAN_SLIDE')}</h2>}
        headerRight={<CloseButton onClick={() => setIsModalOpen(false)} />}
      >
        <div className="dhan-guru-dialog__gurus">
          {gurus.map((guru, index) => (
            <ButtonCard
              key={guru}
              className="dhan-guru-dialog__guru"
              onClick={() => pickFromModal(index)}
            >
              {i18n.t(`INSERT.DHAN_GURU.${guru}`)}
            </ButtonCard>
          ))}
        </div>
      </Dialog>
      <h4 className="settings-group__title">{i18n.t('INSERT.ADD_DHAN_GURU')}</h4>
      <div className="dhan-guru-pane">
        {gurus.map((guru, index) => (
          <div
            className="dhan-guru-button"
            key={guru}
            onClick={() => {
              insertDhanGuru(index);
            }}
          >
            <span className="dhan-guru-button-prefix">{getGuruIndex(index)}</span>
            {isGurmukhi ? (
              <span className="dhan-guru-button-text">
                {anvaad.unicode(insertSlide.slideStrings.dhanguruStrings[index].gurmukhi)}
              </span>
            ) : (
              <span className="dhan-guru-button-text">{i18n.t(`INSERT.DHAN_GURU.${guru}`)}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
