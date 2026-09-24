import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FatehTab, FatehTabList, FatehTabs } from '@khalisfoundation/sikhi-ui';
import { updateViewerScale } from '../../viewer/utils';
import { setCurrentWorkspace } from '../../common/store/redux/userSettingsSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

// const { store } = remote.require('./app');

const WorkspaceBar = () => {
  const { currentWorkspace } = useSelector((state) => state.userSettings);
  const { minimizedBySingleDisplay } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const presenterIdentifier = i18n.t('WORKSPACES.PRESENTER');
  const singleDisplayIdentifier = i18n.t('WORKSPACES.SINGLE_DISPLAY');
  const multiPaneIdentifier = i18n.t('WORKSPACES.MULTI_PANE');
  const workspaces = [singleDisplayIdentifier, presenterIdentifier, multiPaneIdentifier];

  const handleWorkspaceChange = (workspace) => {
    const moveToPresenter = workspace === presenterIdentifier;
    if (moveToPresenter) {
      global.controller['presenter-view']();
    }
    if (currentWorkspace !== workspace) {
      dispatch(setCurrentWorkspace(workspace));
    }
    analytics.trackEvent({
      category: 'workspace',
      action: 'changed',
      label: workspace,
    });
    setTimeout(() => {
      updateViewerScale();
    }, 2500);
  };

  return (
    <div
      className={`workspace-bar 
      ${minimizedBySingleDisplay ? 'single-display-hide-top' : 'single-display-show-top'}`}
    >
      <FatehTabs
        index={workspaces.indexOf(currentWorkspace)}
        onChange={(index) => handleWorkspaceChange(workspaces[index])}
      >
        <FatehTabList variant="underline">
          {workspaces.map((workspace) => (
            <FatehTab key={workspace} className="workspace-name">
              {workspace}
            </FatehTab>
          ))}
        </FatehTabList>
      </FatehTabs>
    </div>
  );
};

export default WorkspaceBar;
