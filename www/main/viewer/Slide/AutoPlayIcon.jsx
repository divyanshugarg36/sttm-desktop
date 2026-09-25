import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { Icon } from '../../common/sttm-ui';

const SIZE = 40;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;

const PlayIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 5 Q7 12 8 19 Q12 17 18 12 Q12 7 8 5 Z" fill="currentColor" />
  </svg>
);

PlayIcon.propTypes = {
  size: PropTypes.number,
};

const PauseIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="2" ry="2" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="2" ry="2" />
  </svg>
);

PauseIcon.propTypes = {
  size: PropTypes.number,
};

const AutoPlayIcon = () => {
  const { autoplayToggle, autoplayDelay } = useSelector((state) => state.userSettings);

  const toggleAutoplay = () => {
    const globalObj = {
      actionName: 'setAutoplayToggle',
      payload: !autoplayToggle,
      settingType: 'userSettings',
    };
    global.platform.ipc.send('update-global-setting', JSON.stringify(globalObj));
  };

  const handleSpeedChange = (sum) => {
    const newDelay = autoplayDelay + sum;
    if (newDelay !== autoplayDelay && newDelay > 0 && newDelay <= 20) {
      const globalObj = {
        actionName: 'setAutoplayDelay',
        payload: newDelay,
        settingType: 'userSettings',
      };
      global.platform.ipc.send('update-global-setting', JSON.stringify(globalObj));
    }
  };

  return (
    <div className="autoplay-icon-container">
      <PrimaryButton
        className={`${autoplayDelay <= 1 ? 'disabled' : ''} decrease-speed-btn`}
        variant="ghost"
        mode="icon"
        size="sm"
        shape="circle"
        aria-label="Decrease speed"
        style={{
          display: autoplayToggle ? 'inline-flex' : 'none',
        }}
        onClick={() => {
          handleSpeedChange(-1);
        }}
      >
        <Icon name="minus" />
      </PrimaryButton>
      <div className="autoplay-center-container">
        <div className="speed-display">{autoplayDelay}s</div>
        <PrimaryButton
          aria-label={autoplayToggle ? 'Pause autoplay' : 'Start autoplay'}
          onClick={toggleAutoplay}
          className="autoplay-icon-btn"
          variant="plain"
          mode="icon"
          shape="circle"
        >
          <svg width={SIZE} height={SIZE}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              className="bg-circle"
              strokeWidth={STROKE}
              fill="none"
            />
          </svg>
          <span className="play-pause-container">
            {autoplayToggle ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </span>
        </PrimaryButton>
      </div>
      <PrimaryButton
        className={`${autoplayDelay >= 20 ? 'disabled' : ''} increase-speed-btn`}
        variant="ghost"
        mode="icon"
        size="sm"
        shape="circle"
        aria-label="Increase speed"
        style={{
          display: autoplayToggle ? 'inline-flex' : 'none',
        }}
        onClick={() => {
          handleSpeedChange(1);
        }}
      >
        <Icon name="plus" />
      </PrimaryButton>
    </div>
  );
};

export default AutoPlayIcon;
