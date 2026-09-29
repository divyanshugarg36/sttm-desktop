import React from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';

import Categories from './Categories';
import type { SettingsCategory } from '../utils/parse-settings';

type SettingsContainerProps = {
  settingsObj: Record<string, SettingsCategory>;
};

const SettingsContainer = ({ settingsObj }: SettingsContainerProps) => {
  const settingsList: React.ReactElement[] = [];
  Object.keys(settingsObj).forEach((cat, index) => {
    const category = settingsObj[cat];
    if (category.type === 'title') {
      settingsList.push(
        <Box
          variant="gradient"
          className="settings-category"
          id={cat}
          key={`settings-category-${index}`}
        >
          <Categories category={category} />
        </Box>,
      );
    }
  });
  return <> {settingsList} </>;
};

export default SettingsContainer;
