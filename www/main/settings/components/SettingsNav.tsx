import React, { useState } from 'react';
import { Box, FatehTab, FatehTabList, FatehTabs } from '@khalisfoundation/sikhi-ui';

import { i18n } from '../../common/main-app';
import type { SettingsCategoryConfig } from '../utils/parse-settings';

type SettingsNavProps = {
  settingsNavObj: Record<string, SettingsCategoryConfig>;
};

// The settings categories as sikhi-ui pilled tabs, like the misc pane's, on a
// gradient Box like the categories'. All categories stay on one scrolling
// page; a tab scrolls to its category.
const SettingsNav = ({ settingsNavObj }: SettingsNavProps) => {
  const categories = Object.keys(settingsNavObj);
  const [activeIndex, setActiveIndex] = useState(0);

  const openCategory = (index: number) => {
    setActiveIndex(index);
    document
      .getElementById(categories[index])!
      .scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  return (
    <Box variant="gradient" className="settings-nav">
      <FatehTabs index={activeIndex} onChange={openCategory}>
        <FatehTabList variant="pilled">
          {categories.map((category) => (
            <FatehTab key={category} className="settings-nav__tab">
              {i18n.t(`SETTINGS.${settingsNavObj[category].title}`)}
            </FatehTab>
          ))}
        </FatehTabList>
      </FatehTabs>
    </Box>
  );
};

export default SettingsNav;
