import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { PrimaryButton, Tooltip } from '@khalisfoundation/sikhi-ui';
import { setPaddingToolsOpen } from '../../common/store/redux/viewerSettingsSlice';
import Icon from '../../common/sttm-ui/icon';
import { ToolStepper } from './ToolStepper';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const PADDING_VARIANTS = ['top', 'right', 'bottom', 'left'];
const PADDING_STEP = 4;
const PADDING_MAX = 48;
const PADDING_MIN = 0;

// Padding Tools: a button in the viewer's corner that opens a popup (as
// sttm-next's shabad controls do) with a − value + stepper per side.
const PaddingTools = () => {
  const { containerPadding, paddingToolsOpen } = useSelector((state) => state.viewerSettings);
  const dispatch = useDispatch();

  const changePadding = (variant, step) => {
    const current = parseInt(containerPadding[variant], 10);
    const value = Math.min(PADDING_MAX, Math.max(PADDING_MIN, current + step));
    if (value !== current) {
      global.platform.ipc.send(
        'update-global-setting',
        JSON.stringify({
          actionName: 'setPadding',
          payload: { type: variant, value },
          settingType: 'viewerSettings',
        }),
      );
    }
  };

  return (
    <div className="slide-paddingtools">
      <Tooltip
        trigger="click"
        position="bottom-end"
        showClose={false}
        maxWidth={320}
        open={paddingToolsOpen}
        onOpenChange={(open) => dispatch(setPaddingToolsOpen(open))}
        content={
          <div className="viewer-tools">
            <div className="viewer-tools__title">{i18n.t('SETTINGS.PADDING_TOOLS')}</div>
            {PADDING_VARIANTS.map((variant) => (
              <div key={variant} className="viewer-tools__row viewer-tools__row--inline">
                <span className="viewer-tools__label">
                  {i18n.t(`PADDING_TOOLS.${variant.toUpperCase()}`)}
                </span>
                <ToolStepper
                  label={`${variant} padding`}
                  value={parseInt(containerPadding[variant], 10)}
                  min={PADDING_MIN}
                  max={PADDING_MAX}
                  onDecrease={() => changePadding(variant, -PADDING_STEP)}
                  onIncrease={() => changePadding(variant, PADDING_STEP)}
                />
              </div>
            ))}
          </div>
        }
      >
        <PrimaryButton
          className="viewer-tools-trigger"
          variant="plain"
          mode="icon"
          size="sm"
          aria-label={i18n.t('SETTINGS.PADDING_TOOLS')}
          title={i18n.t('SETTINGS.PADDING_TOOLS')}
        >
          <Icon name="maximize" />
        </PrimaryButton>
      </Tooltip>
    </div>
  );
};

export default PaddingTools;
