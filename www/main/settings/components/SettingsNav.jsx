import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, FatehTab, FatehTabList, FatehTabs } from '@khalisfoundation/sikhi-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

// The settings categories as sikhi-ui pilled tabs, like the misc pane's, on a
// gradient Box like the categories'. All categories stay on one scrolling
// page; a tab scrolls to its category.
const SettingsNav = ({ settingsNavObj }) => {
  const categories = Object.keys(settingsNavObj);
  const [activeIndex, setActiveIndex] = useState(0);

  const openCategory = (index) => {
    setActiveIndex(index);
    document
      .getElementById(categories[index])
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

SettingsNav.propTypes = {
  settingsNavObj: PropTypes.object,
};

export default SettingsNav;
