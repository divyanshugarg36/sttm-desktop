import React from 'react';
import PropTypes from 'prop-types';
import Pane from '../../../common/sttm-ui/pane/Pane';
import SearchContent from './SearchContent';
import SearchFooter from './SearchFooter';

const SearchPane = ({ className = '' }) => (
  <div className={`pane-container search-pane ${className}`}>
    <Pane content={SearchContent} footer={SearchFooter} />
  </div>
);

SearchPane.propTypes = {
  className: PropTypes.string,
};

export default SearchPane;
