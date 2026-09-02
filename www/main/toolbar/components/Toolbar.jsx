import React from 'react';
import { useSelector } from 'react-redux';

import ToolbarItem from './ToolbarItem';

const Toolbar = () => {
  const { minimizedBySingleDisplay } = useSelector((state) => state.navigator);
  const toolbarTop = ['sunder-gutka', 'ceremonies', 'announcement'];
  const toolbarBottom = ['sync-button', 'lock-screen', 'auth-dialog', 'settings'];

  return (
    <div
      id="toolbar-nav"
      className={`${
        minimizedBySingleDisplay ? 'single-display-hide-left' : 'single-display-show-left'
      }`}
    >
      <div className="toolbar-top">
        {toolbarTop.map((itemName, index) => (
          <ToolbarItem key={index} itemName={itemName} />
        ))}
      </div>

      <div className="toolbar-bottom">
        {toolbarBottom.map((itemName, index) => (
          <ToolbarItem key={index} itemName={itemName} />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
