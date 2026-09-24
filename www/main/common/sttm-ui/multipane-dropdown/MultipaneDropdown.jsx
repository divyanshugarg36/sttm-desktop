import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Icon from '../icon';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const MultipaneDropdown = ({
  paneSelectorActive,
  setPaneSelectorActive,
  paneSelector,
  clickHandler,
}) => {
  const { pane1, pane2, pane3 } = useSelector((state) => state.navigator);
  const dropdownOptions = [pane1, pane2, pane3].map((item, index) => (
    <div
      key={`pane-option-${index + 1}`}
      onClick={(e) => {
        if (!item.locked) {
          clickHandler(e, index + 1);
        }
      }}
      title={item.locked ? i18n.t('MULTI_PANE.LOCKED_PANE_MSG') : ''}
      className={`history-item-container option-pane-${index + 1} ${item.locked ? 'locked-option' : ''}`}
    >
      <div className="history-item">
        {`Pane ${index + 1}`}
        {item.locked ? (
          <Icon name="lock" style={{ fontSize: '12px', marginLeft: '8px' }} />
        ) : (
          ''
        )}
      </div>
    </div>
  ));
  return (
    <div
      className={`history-results multipane-dropdown ${
        paneSelectorActive ? 'enabled' : 'disabled'
      }`}
      ref={paneSelector}
    >
      {dropdownOptions}
    </div>
  );
};

MultipaneDropdown.propTypes = {
  paneSelectorActive: PropTypes.bool,
  setPaneSelectorActive: PropTypes.func,
  paneSelector: PropTypes.object,
  clickHandler: PropTypes.func,
};

export default MultipaneDropdown;
