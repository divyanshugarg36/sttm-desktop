import React from 'react';

import { PrimaryButton, Tooltip } from '@khalisfoundation/sikhi-ui';
import {
  setPaddingToolsOpen,
  type ContainerPadding,
} from '../../common/store/redux/viewerSettingsSlice';
import Icon from '../../common/sttm-ui/icon';
import { i18n } from '../../common/main-app';
import { sendGlobalSetting } from '../../common/ipc';
import { useViewerDispatch, useViewerSelector } from '../store/hooks';
import { ToolStepper } from './ToolStepper';

const PADDING_VARIANTS: (keyof ContainerPadding)[] = ['top', 'right', 'bottom', 'left'];
const PADDING_STEP = 4;
const PADDING_MAX = 48;
const PADDING_MIN = 0;

// Padding Tools: a button in the viewer's corner that opens a popup (as
// sttm-next's shabad controls do) with a − value + stepper per side.
const PaddingTools = () => {
  const { containerPadding, paddingToolsOpen } = useViewerSelector((state) => state.viewerSettings);
  const dispatch = useViewerDispatch();

  const changePadding = (variant: keyof ContainerPadding, step: number) => {
    const current = parseInt(String(containerPadding[variant]), 10);
    const value = Math.min(PADDING_MAX, Math.max(PADDING_MIN, current + step));
    if (value !== current) {
      sendGlobalSetting('setPadding', { type: variant, value }, 'viewerSettings');
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
                  value={parseInt(String(containerPadding[variant]), 10)}
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
