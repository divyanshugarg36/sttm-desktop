import React from 'react';

import OverlayCategories from './OverlayCategories';
import Switch from '../../common/sttm-ui/switch';
import { i18n } from '../../common/main-app';
import type { GeneratedCategory } from '../../common/utils/settings-obj-generator';

type OverlaySettingsContainerProps = {
  settingsObj: Record<string, GeneratedCategory>;
};

const OverlaySettingsContainer = ({ settingsObj }: OverlaySettingsContainerProps) => {
  const settingsList: React.ReactElement[] = [];
  Object.keys(settingsObj).forEach((cat, index) => {
    const category = settingsObj[cat];
    if (category.type === 'title') {
      settingsList.push(
        <div
          id={cat}
          className="overlay-settings-container"
          key={`overlay-settings-container-${index}`}
        >
          <div className="category-header">
            {category.title && (
              <p className="overlay-window-text"> {i18n.t(`BANI_OVERLAY.${category.title}`)} </p>
            )}

            {category.toggle && (
              <Switch
                controlId={`subcat-switch`}
                className={`control-item-switch`}
                value={false}
                onToggle={() => {
                  // Add logic for switch toggle here
                }}
              />
            )}
          </div>
          <OverlayCategories category={category} />
        </div>,
      );
    }
  });
  return <> {settingsList} </>;
};

export default OverlaySettingsContainer;
