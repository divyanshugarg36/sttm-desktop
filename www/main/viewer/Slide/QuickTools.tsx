import React, { useEffect, useState } from 'react';

import { PrimaryButton, SimpleSelect, Tooltip } from '@khalisfoundation/sikhi-ui';
import {
  classNames,
  contentLabelKey,
  convertToCamelCase,
  toGroupedSelectOptions,
} from '../../common/utils';
import { setQuickToolsOpen } from '../../common/store/redux/viewerSettingsSlice';
import type { UserSettingsState } from '../../common/store/redux/userSettingsSlice';
import type { BaniOptionGroup } from '../../banidb/constants';
import Icon from '../../common/sttm-ui/icon';
import { i18n } from '../../common/main-app';
import { sendGlobalSetting } from '../../common/ipc';
import { useViewerDispatch, useViewerSelector } from '../store/hooks';
import { ToolStepper } from './ToolStepper';

const MIN_FONT_SIZE = 1;
const MAX_FONT_SIZE = 20;

type QuickToolsProps = {
  isMiscSlide: boolean;
  baniOptions: BaniOptionGroup[];
};

// Quick Tools: a cog in the viewer's corner that opens a popup (as sttm-next's
// shabad controls do) with, per line of the slide, what it shows, whether it
// shows, and its font size.
const QuickTools = ({ isMiscSlide, baniOptions }: QuickToolsProps) => {
  const userSettings = useViewerSelector((state) => state.userSettings);

  const { quickToolsOpen } = useViewerSelector((state) => state.viewerSettings);
  const dispatch = useViewerDispatch();

  const [prevOrder, setPrevOrder] = useState<string[]>([]);

  const [baniOrder, setBaniOrder] = useState<string[]>([
    'gurbani',
    userSettings.content1,
    userSettings.content2,
    userSettings.content3,
  ]);

  const { disabledContent } = useViewerSelector((state) => state.navigator);

  const dropdownLabel = (option: string) => i18n.t(contentLabelKey(option));

  // A line's settings: Bani / Announcements by name, the content lines by
  // position (content1..3).
  const settingNames = (order: string, index: number, setting: 'FontSize' | 'Visibility') =>
    (index > 0
      ? { state: `content${index}${setting}`, action: `setContent${index}${setting}` }
      : {
          state: `${order}${setting}`,
          action: `set${convertToCamelCase(`${order}-${setting}`, true)}`,
        }) as { state: keyof UserSettingsState; action: string };

  const changeFontSize = (order: string, index: number, step: number) => {
    const { state, action } = settingNames(order, index, 'FontSize');
    const current = parseInt(String(userSettings[state]), 10);
    const next = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, current + step));
    if (next !== current) {
      sendGlobalSetting(action, next);
    }
  };

  const toggleVisibility = (order: string, index: number) => {
    const { state, action } = settingNames(order, index, 'Visibility');
    sendGlobalSetting(action, !userSettings[state]);
  };

  const changeContent = (index: number, value: string) => {
    const newOrder = [...baniOrder];
    newOrder[index] = value;
    setBaniOrder(newOrder);
    sendGlobalSetting(`setContent${index}`, value);
  };

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

  const renderLine = (order: string, index: number) => {
    const label = dropdownLabel(order);
    const isContentLine = index > 0;
    const isVisible =
      !isContentLine || userSettings[settingNames(order, index, 'Visibility').state];

    return (
      <div key={`line-${index}`} className="viewer-tools__row">
        <div className="viewer-tools__row-head">
          <span className="viewer-tools__label">{label}</span>
          {isContentLine && (
            <PrimaryButton
              variant="ghost"
              mode="icon"
              size="xs"
              aria-label={`${isVisible ? 'Hide' : 'Show'} ${label}`}
              onClick={() => toggleVisibility(order, index)}
            >
              <Icon name={isVisible ? 'eye' : 'eye-off'} />
            </PrimaryButton>
          )}
        </div>
        {isContentLine && (
          <SimpleSelect
            variant="bordered"
            selectSize="sm"
            value={order}
            onChange={(event) => changeContent(index, event.target.value)}
            options={toGroupedSelectOptions(baniOptions, {
              groupLabel: dropdownLabel,
              isDisabled: (id) => disabledContent.includes(id),
            })}
          />
        )}
        <ToolStepper
          label={`${label} font size`}
          value={parseInt(String(userSettings[settingNames(order, index, 'FontSize').state]), 10)}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          onDecrease={() => changeFontSize(order, index, -1)}
          onIncrease={() => changeFontSize(order, index, 1)}
        />
      </div>
    );
  };

  return (
    <div className={classNames('slide-quicktools', !userSettings.quickTools && 'hide-quicktools')}>
      <Tooltip
        trigger="click"
        position="bottom-start"
        showClose={false}
        maxWidth={320}
        open={quickToolsOpen}
        onOpenChange={(open) => dispatch(setQuickToolsOpen(open))}
        content={
          <div className="viewer-tools">
            <div className="viewer-tools__title">{i18n.t('QUICK_TOOLS.SELF')}</div>
            {baniOrder.map(renderLine)}
          </div>
        }
      >
        <PrimaryButton
          className="viewer-tools-trigger"
          variant="plain"
          mode="icon"
          size="sm"
          aria-label={i18n.t('QUICK_TOOLS.SELF')}
          title={i18n.t('QUICK_TOOLS.SELF')}
        >
          <Icon name="cog-four-solid" />
        </PrimaryButton>
      </Tooltip>
    </div>
  );
};

export default QuickTools;
