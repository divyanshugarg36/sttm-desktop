import React from 'react';
import { i18n } from '../../main-app';
import { useAppSelector } from '../../store/redux/hooks';
import Icon from '../icon';

type MultipaneDropdownProps = {
  paneSelectorActive: boolean;
  /** Passed by callers; not used here. */
  setPaneSelectorActive?: (active: boolean) => void;
  paneSelector: React.Ref<HTMLDivElement>;
  clickHandler: (event: React.MouseEvent<HTMLDivElement>, paneId: number) => void;
};

const MultipaneDropdown = ({
  paneSelectorActive,
  paneSelector,
  clickHandler,
}: MultipaneDropdownProps) => {
  const { pane1, pane2, pane3 } = useAppSelector((state) => state.navigator);
  const dropdownOptions = [pane1, pane2, pane3].map((item, index) => (
    <div
      key={`pane-option-${index + 1}`}
      onClick={(e) => {
        if (!item.locked) {
          clickHandler(e, index + 1);
        }
      }}
      title={item.locked ? i18n.t('MULTI_PANE.LOCKED_PANE_MSG') : ''}
      className={`option-list__row multipane-dropdown__option ${
        item.locked ? 'multipane-dropdown__option--locked' : ''
      }`}
    >
      <div className="option-list__label">
        {`Pane ${index + 1}`}
        {item.locked ? <Icon name="lock" style={{ fontSize: '12px', marginLeft: '8px' }} /> : ''}
      </div>
    </div>
  ));
  return (
    <div
      className={`option-list multipane-dropdown ${
        paneSelectorActive ? 'multipane-dropdown--open' : 'multipane-dropdown--closed'
      }`}
      ref={paneSelector}
    >
      {dropdownOptions}
    </div>
  );
};

export default MultipaneDropdown;
