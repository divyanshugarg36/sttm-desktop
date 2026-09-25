import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { SimpleSelect } from '@khalisfoundation/sikhi-ui';
import { convertToCamelCase, toGroupedSelectOptions } from '../../common/utils';
import { setQuickToolsOpen } from '../../common/store/redux/viewerSettingsSlice';
import platform from '../../desktop_scripts';
import Icon from '../../common/sttm-ui/icon';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

global.platform = platform;

const QuickTools = ({ isMiscSlide, baniOptions }) => {
  const userSettings = useSelector((state) => state.userSettings);

  const { quickToolsOpen } = useSelector((state) => state.viewerSettings);
  const dispatch = useDispatch();

  const [prevOrder, setPrevOrder] = useState([]);

  const [baniOrder, setBaniOrder] = useState([
    'gurbani',
    userSettings.content1,
    userSettings.content2,
    userSettings.content3,
  ]);

  const { disabledContent } = useSelector((state) => state.navigator);

  const dropdownLabel = (option) => {
    if (option.includes('gurbani')) {
      return i18n.t(`QUICK_TOOLS.BANI`);
    }
    if (option.includes('teeka')) {
      return i18n.t(`QUICK_TOOLS.TEEKA`);
    }
    if (option.includes('translation')) {
      return i18n.t(`QUICK_TOOLS.TRANSLATION`);
    }
    if (option.includes('transliteration')) {
      return i18n.t(`QUICK_TOOLS.TRANSLITERATION`);
    }
    return '';
  };

  const quickToolsModifiers = [
    {
      name: 'visibility',
      actionName: 'Visibility',
    },
    {
      name: 'minus',
      actionName: 'FontSize',
    },
    {
      name: 'plus',
      actionName: 'FontSize',
    },
  ];

  const createGlobalPlatformObj = (name, toolname, index, action) => {
    let payload;
    let actionName;
    let stateName;
    const maxFontSize = 20;
    const minFontSize = 1;

    if (index > 0) {
      stateName = `content${index}${action}`;
      actionName = `setContent${index}${action}`;
    } else {
      stateName = `${toolname}${action}`;
      actionName = `set${convertToCamelCase(`${toolname}-${action}`, true)}`;
    }

    const currentFontSize = parseInt(userSettings[stateName], 10);

    if (name === 'visibility') {
      payload = !userSettings[stateName];
    } else if (name === 'minus') {
      payload = currentFontSize > minFontSize ? currentFontSize - 1 : minFontSize;
    } else if (name === 'plus') {
      payload = currentFontSize < maxFontSize ? currentFontSize + 1 : maxFontSize;
    }

    // If payload does not change, return null to prevent unnecessary state updates
    if (payload === userSettings[stateName]) {
      return null;
    }

    return {
      actionName,
      payload,
      settingType: 'userSettings',
    };
  };

  const getIconName = (name, index, action) => {
    if (index > 0 && name === 'visibility')
      return userSettings[`content${index}${action}`] ? 'eye' : 'eye-off';
    if (name === 'minus') return 'minus-circle';
    if (name === 'plus') return 'plus-circle';
    return null;
  };

  const hide = (name, toolName) =>
    name === 'visibility' && ['gurbani', 'announcements'].includes(toolName)
      ? 'quicktool-icons-hidden'
      : '';

  const bakeIcons = (toolName, index, icons) =>
    icons.map(({ name, actionName }) => (
      <div key={name} className={`quicktool-icons ${hide(name, toolName)}`}>
        {getIconName(name, index, actionName) && (
          <Icon
            name={getIconName(name, index, actionName)}
            onClick={() => {
              const globalObj = createGlobalPlatformObj(name, toolName, index, actionName);
              if (globalObj) {
                global.platform.ipc.send('update-global-setting', JSON.stringify(globalObj));
              }
            }}
          />
        )}
      </div>
    ));

  useEffect(() => {
    if (isMiscSlide) {
      if (prevOrder !== baniOrder) {
        setPrevOrder(baniOrder);
      }
      setBaniOrder(['announcements']);
    } else if (baniOrder !== prevOrder && prevOrder.length > 1) {
      setBaniOrder(prevOrder);
    }
  }, [isMiscSlide]);

  useEffect(() => {
    setBaniOrder(['gurbani', userSettings.content1, userSettings.content2, userSettings.content3]);
  }, [userSettings.content1, userSettings.content2, userSettings.content3]);

  const handleQuickTools = (order, index) => {
    if (order === 'gurbani' || order === 'announcements') {
      return <div>{dropdownLabel(order)}</div>;
    }

    return (
      <>
        <div>{dropdownLabel(order)}</div>
        <SimpleSelect
          variant="bordered"
          selectSize="sm"
          value={order}
          onChange={(event) => {
            const newOrder = [...baniOrder];
            newOrder[index] = event.target.value;
            setBaniOrder(newOrder);
            global.platform.ipc.send(
              'update-global-setting',
              JSON.stringify({
                actionName: `setContent${index}`,
                payload: event.target.value,
                settingType: 'userSettings',
              }),
            );
          }}
          options={toGroupedSelectOptions(baniOptions, {
            groupLabel: dropdownLabel,
            isDisabled: (id) => disabledContent.includes(id),
          })}
        />
      </>
    );
  };

  return (
    <div className={`slide-quicktools ${!userSettings.quickTools ? 'hide-quicktools' : ''}`.trim()}>
      <div
        className="quicktool-header"
        onClick={() => dispatch(setQuickToolsOpen(!quickToolsOpen))}
      >
        Quick Tools
        <Icon name={quickToolsOpen ? 'chevron-up' : 'chevron-down'} />
      </div>
      {quickToolsOpen && (
        <div className={`quicktool-body quicktool-${isMiscSlide ? 'announcement' : 'gurbani'}`}>
          {baniOrder.map((order, index) => (
            <div key={`item-${index}`} className="quicktool-item">
              {handleQuickTools(order, index)}
              <div className="quicktool-icons">{bakeIcons(order, index, quickToolsModifiers)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

QuickTools.propTypes = {
  isMiscSlide: PropTypes.bool,
  baniOptions: PropTypes.array,
};

export default QuickTools;
