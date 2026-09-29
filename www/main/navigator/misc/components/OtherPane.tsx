import React, { useState } from 'react';
import { randomShabad } from '../../../banidb';
import { dailyHukamnama } from '../../utils';
import {
  setActiveShabadId,
  setIsRandomShabad,
  setSingleDisplayActiveTab,
  setIsSundarGutkaBani,
  setIsCeremonyBani,
  setPane1,
  setPane2,
  setPane3,
} from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';
import { analytics, i18n } from '../../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';

type OtherPaneProps = {
  className?: string;
};

export const OtherPane = ({ className }: OtherPaneProps) => {
  const [isHukamnamaLoading, setIsHukamnamaLoading] = useState(false);
  const {
    activeShabadId,
    isRandomShabad,
    singleDisplayActiveTab,
    isSundarGutkaBani,
    isCeremonyBani,
    activePaneId,
    pane1,
    pane2,
    pane3,
  } = useAppSelector((state) => state.navigator);
  const dispatch = useAppDispatch();

  const { defaultPaneId } = useAppSelector((state) => state.userSettings);

  const setShabadId = (shabadId: number) => {
    if (!isRandomShabad) {
      dispatch(setIsRandomShabad(true));
    }
    if (singleDisplayActiveTab !== 'shabad') {
      dispatch(setSingleDisplayActiveTab('shabad'));
    }
    if (activeShabadId !== shabadId) {
      dispatch(setActiveShabadId(shabadId));
    }
    if (isSundarGutkaBani) {
      dispatch(setIsSundarGutkaBani(false));
    }
    if (isCeremonyBani) {
      dispatch(setIsCeremonyBani(false));
    }
    const currentPane = activePaneId || defaultPaneId;
    if (currentPane === 1) {
      dispatch(
        setPane1({
          ...pane1,
          activeShabad: shabadId,
          content: i18n.t('MULTI_PANE.SHABAD'),
          baniType: 'shabad',
        }),
      );
    } else if (currentPane === 2) {
      dispatch(
        setPane2({
          ...pane2,
          activeShabad: shabadId,
          content: i18n.t('MULTI_PANE.SHABAD'),
          baniType: 'shabad',
        }),
      );
    } else if (currentPane === 3) {
      dispatch(
        setPane3({
          ...pane3,
          activeShabad: shabadId,
          content: i18n.t('MULTI_PANE.SHABAD'),
          baniType: 'shabad',
        }),
      );
    }
  };

  const openRandomShabad = () => {
    randomShabad().then((randomId) => {
      setShabadId(randomId);
      analytics.trackEvent({
        category: 'display',
        action: 'random-shabad',
        label: 'shabadId',
        value: randomId,
      });
    });
  };

  const openDailyHukamnana = () => {
    if (!isHukamnamaLoading) {
      dailyHukamnama(setIsHukamnamaLoading).then((hukamId) => {
        setIsHukamnamaLoading(false);
        setShabadId(hukamId);
        analytics.trackEvent({
          category: 'display',
          action: 'hukamnama',
          label: 'shabadId',
          value: hukamId,
        });
      });
    }
    setIsHukamnamaLoading(true);
  };

  // Rows like History's: an icon and what it opens.
  const items = [
    {
      key: 'random',
      icon: 'random',
      label: 'OTHERS.SHOW_RANDOM_SHABAD',
      onClick: openRandomShabad,
    },
    {
      key: 'hukamnama',
      icon: 'hukamnama',
      label: 'OTHERS.DAILY_HUKAMNAMA',
      onClick: openDailyHukamnana,
      busy: isHukamnamaLoading,
    },
  ];

  return (
    <ul className={`other-list ${className}`}>
      {items.map(({ key, icon, label, onClick, busy }) => (
        <li key={key}>
          <button type="button" className="other-list__item" onClick={onClick} disabled={busy}>
            <Icon name={icon} className="other-list__icon" />
            {i18n.t(label)}
          </button>
        </li>
      ))}
    </ul>
  );
};
