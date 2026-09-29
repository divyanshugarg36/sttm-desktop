import React from 'react';

import OverlayCategories from './OverlayCategories';
import { i18n } from '../../common/main-app';
import type { GeneratedCategory } from '../../common/utils/settings-obj-generator';

type OverlaySettingsContainerProps = {
  settingsObj: Record<string, GeneratedCategory>;
  /** The bottom bar: its controls in a row, without titles. */
  isToolbar?: boolean;
};

// Each category is a titled group of setting rows, like Settings'; in the
// bottom bar, a group of controls.
const OverlaySettingsContainer = ({
  settingsObj,
  isToolbar = false,
}: OverlaySettingsContainerProps) => (
  <>
    {Object.keys(settingsObj)
      .filter((cat) => settingsObj[cat].type === 'title')
      .map((cat) => {
        const category = settingsObj[cat];
        return (
          <section
            id={cat}
            key={cat}
            className={isToolbar ? 'overlay-toolbar__group' : 'settings-group'}
          >
            {!isToolbar && category.title && (
              <h4 className="settings-group__title">{i18n.t(`BANI_OVERLAY.${category.title}`)}</h4>
            )}
            <OverlayCategories category={category} isToolbar={isToolbar} />
          </section>
        );
      })}
  </>
);

export default OverlaySettingsContainer;
