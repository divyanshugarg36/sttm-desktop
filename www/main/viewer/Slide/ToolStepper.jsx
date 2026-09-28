import React from 'react';
import PropTypes from 'prop-types';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../../common/sttm-ui/icon';

// A − value + row for the viewer's tool popups (font size, padding), styled
// like sttm-next's shabad controls: round muted buttons around the value.
export const ToolStepper = ({ label, value, onDecrease, onIncrease, min, max }) => (
  <div className="tool-stepper">
    <PrimaryButton
      variant="muted"
      mode="icon"
      size="xs"
      shape="circle"
      aria-label={`Decrease ${label}`}
      disabled={value <= min}
      onClick={onDecrease}
    >
      <Icon name="minus" />
    </PrimaryButton>
    <span className="tool-stepper__value">{value}</span>
    <PrimaryButton
      variant="muted"
      mode="icon"
      size="xs"
      shape="circle"
      aria-label={`Increase ${label}`}
      disabled={value >= max}
      onClick={onIncrease}
    >
      <Icon name="plus" />
    </PrimaryButton>
  </div>
);

ToolStepper.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
};
