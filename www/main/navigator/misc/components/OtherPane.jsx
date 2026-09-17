import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
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

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const analytics = remote.getGlobal('analytics');

export const OtherPane = ({ className }) => {
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
  } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const { defaultPaneId } = useSelector((state) => state.userSettings);

  const setShabadId = (shabadId) => {
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

  return (
    <ul className={`list-of-items ${className}`}>
      <li>
        <a onClick={openRandomShabad}>
          <i className="fa fa-random list-icon" />
          {i18n.t('OTHERS.SHOW_RANDOM_SHABAD')}
        </a>
      </li>
      <li>
        <a onClick={openDailyHukamnana}>
          <i className="fa fa-gavel list-icon" />
          {i18n.t('OTHERS.DAILY_HUKAMNAMA')}
        </a>
      </li>
    </ul>
  );
};

OtherPane.propTypes = {
  className: PropTypes.string,
};
