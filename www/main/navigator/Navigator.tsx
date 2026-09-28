import React from 'react';
import SearchPane from './search/components/SearchPane';
import ShabadPane from './shabad/ShabadPane';
import { MiscPane, QuickInsert } from './misc/components';
import ViewerPane from './viewer/ViewerPane';
import { Pane } from '../common/sttm-ui/pane';
import { singleDisplayContent, singleDisplayFooter, singleDisplayHeader } from './single-display';
import { i18n } from '../common/main-app';
import { useAppSelector } from '../common/store/redux/hooks';

const Navigator = () => {
  const { currentWorkspace } = useAppSelector((state) => state.userSettings);

  const { minimizedBySingleDisplay } = useAppSelector((state) => state.navigator);

  let controllerMarkup: React.ReactNode = null;
  const isCurrentWorkSpaceSingleDisplay = currentWorkspace === i18n.t('WORKSPACES.SINGLE_DISPLAY');

  if (isCurrentWorkSpaceSingleDisplay) {
    controllerMarkup = (
      <div
        className={`single-display__navigator ${
          minimizedBySingleDisplay
            ? 'single-display__navigator--minimized'
            : 'single-display__navigator--expanded'
        }`}
      >
        <Pane
          header={singleDisplayHeader}
          content={singleDisplayContent}
          footer={singleDisplayFooter}
          className="single-display__pane"
        />
      </div>
    );
  } else if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
    controllerMarkup = (
      <div className="multipane-layout__panes">
        <div className="multipane-layout__pane multipane-layout__pane--1">
          <ShabadPane multiPaneId={1} />
        </div>
        <div className="multipane-layout__pane multipane-layout__pane--2">
          <ShabadPane multiPaneId={2} />
        </div>
        <div className="multipane-layout__pane multipane-layout__pane--3">
          <ShabadPane multiPaneId={3} />
        </div>
      </div>
    );
  } else {
    // Presenter: the viewer and the shabad's verses share one box on the left,
    // search and the misc pane stack on the right.
    return (
      <div className="presenter-layout">
        <div className="presenter-layout__column presenter-layout__column--viewer">
          <div className="pane pane--box presenter-layout__box">
            <ViewerPane plain />
            <ShabadPane plain footer={QuickInsert} />
          </div>
        </div>
        <div className="presenter-layout__column">
          <SearchPane />
          <MiscPane />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={
          isCurrentWorkSpaceSingleDisplay ? 'single-display__viewer' : 'multipane-layout__top'
        }
      >
        <ViewerPane />
        {!isCurrentWorkSpaceSingleDisplay && <SearchPane />}
      </div>
      {controllerMarkup}
    </>
  );
};

export default Navigator;
