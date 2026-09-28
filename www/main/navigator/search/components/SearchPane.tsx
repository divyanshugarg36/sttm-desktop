import React from 'react';
import Pane from '../../../common/sttm-ui/pane/Pane';
import SearchContent from './SearchContent';
import SearchFooter from './SearchFooter';

type SearchPaneProps = {
  className?: string;
};

const SearchPane = ({ className = '' }: SearchPaneProps) => (
  <div className={`pane-wrapper search-pane ${className}`}>
    <Pane content={SearchContent} footer={SearchFooter} />
  </div>
);

export default SearchPane;
