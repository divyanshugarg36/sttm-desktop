import React, { useState, useEffect } from 'react';
import anvaad from 'anvaad-js';
import insertSlide from '../../../common/constants/slidedb';
import tingle from '../../../common/vendor/tingle';
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

  let slidePage = `<h1 class = "modalTitle">${i18n.t('INSERT.INSERT_DHAN_SLIDE')}</h1>
  <div class="btn-group" id = "btn-group">`;
  gurus.forEach((guru, index) => {
    slidePage += `<button class="guru" id="guru${index}">${i18n.t(
      `INSERT.DHAN_GURU.${guru}`,
    )}</button>`;
  });
  slidePage += `</div>`;

  const showDhanGuruModal = () => {
    if (!isModalOpen) {
      const modal = new tingle.Modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        onClose() {
          modal.modal.classList.remove('tingle-modal--visible');
          setIsModalOpen(false);
          modal.destroy();
        },
        beforeClose() {
          return true; // close the modal
        },
      });
      if (!modal.isOpen()) {
        setIsModalOpen(true);
        const buttonOnClick = () => {
          gurus.forEach((guru, index) => {
            document.querySelector<HTMLElement>(`#guru${index}`)!.onclick = () => {
              addDhanGuruSlide(
                insertSlide.slideStrings.dhanguruStrings[index][
                  isMiscSlideGurmukhi ? 'gurmukhi' : 'english'
                ],
              );
              setCurrentDhanGuruIndex(index);
              modal.close();
              setIsModalOpen(false);
              modal.destroy();
            };
          });
        };

        // sets the default page to Dhan Guru slide page
        modal.setContent(slidePage);
        buttonOnClick();
        modal.open();
      }
    }
  };

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
      showDhanGuruModal();
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
    <>
      <header className="sync-header">
        <h3>{i18n.t('INSERT.ADD_DHAN_GURU')}</h3>
      </header>
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
    </>
  );
};
