import React, { useRef, useState } from 'react';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { useSlides } from '../../../common/hooks';
import { MultipaneDropdown } from '../../../common/sttm-ui';
import { useAppSelector } from '../../../common/store/redux/hooks';
import { i18n } from '../../../common/main-app';

const MiscSlides = () => {
  const {
    displayWaheguruSlide,
    displayMoolMantraSlide,
    displayBlankViewer,
    displayAnandSahibBhog,
  } = useSlides();

  const { currentWorkspace, defaultPaneId } = useAppSelector((state) => state.userSettings);

  const [paneSelectorActive, setPaneSelectorActive] = useState(false);
  const paneSelector = useRef<HTMLDivElement>(null);

  const openSlideFromDropdown = (_e: React.MouseEvent<HTMLDivElement>, paneId: number) => {
    displayAnandSahibBhog({ openedFrom: 'shortcut-tray', paneId });
    setPaneSelectorActive(false);
  };

  return (
    <section className="settings-group">
      <h4 className="settings-group__title">{i18n.t('INSERT.ADD_SLIDES')}</h4>

      <div className="misc-slides-pane">
        {
          <MultipaneDropdown
            paneSelectorActive={paneSelectorActive}
            setPaneSelectorActive={setPaneSelectorActive}
            paneSelector={paneSelector}
            clickHandler={openSlideFromDropdown}
          />
        }
        <PrimaryButton
          className="misc-slide-button"
          variant="amber"
          size="sm"
          shape="rounded-md"
          onClick={(e) => {
            if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
              paneSelector.current!.style.left = `${e.clientX - 100}px`;
              if (window.innerHeight - e.clientY > 200) {
                paneSelector.current!.style.top = `${e.clientY - 30}px`;
              } else {
                paneSelector.current!.style.top = `${e.clientY - 195}px`;
              }
              setPaneSelectorActive(true);
            } else {
              displayAnandSahibBhog({ openedFrom: 'shortcut-tray', paneId: defaultPaneId });
            }
          }}
        >
          {i18n.t(`SHORTCUT_TRAY.ANAND_SAHIB`)}
        </PrimaryButton>
        <PrimaryButton
          className="misc-slide-button"
          variant="amber"
          size="sm"
          shape="rounded-md"
          onClick={() => {
            setPaneSelectorActive(false);
            displayMoolMantraSlide({ openedFrom: 'shortcut-tray' });
          }}
        >
          {i18n.t(`SHORTCUT_TRAY.MOOL_MANTRA`)}
        </PrimaryButton>
        <PrimaryButton
          className="misc-slide-button"
          variant="amber"
          size="sm"
          shape="rounded-md"
          onClick={() => {
            setPaneSelectorActive(false);
            displayWaheguruSlide({ openedFrom: 'shortcut-tray' });
          }}
        >
          ਵਾਹਿਗੁਰੂ
        </PrimaryButton>
        <PrimaryButton
          className="misc-slide-button"
          variant="amber"
          size="sm"
          shape="rounded-md"
          onClick={() => {
            setPaneSelectorActive(false);
            displayBlankViewer({ openedFrom: 'shortcut-tray' });
          }}
        >
          {i18n.t(`SHORTCUT_TRAY.BLANK`)}
        </PrimaryButton>
      </div>
    </section>
  );
};

export default MiscSlides;
