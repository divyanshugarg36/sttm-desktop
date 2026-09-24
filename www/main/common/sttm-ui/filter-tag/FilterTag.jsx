import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../icon';

const FilterTag = ({ close, title, filterType }) => (
  <div className="filter-tag" title={filterType}>
    <span className="filter-tag--remove" onClick={close}>
      <Icon name="x" />
    </span>
    <span className="filter-tag--title">{title}</span>
  </div>
);

FilterTag.propTypes = {
  close: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  filterType: PropTypes.string.isRequired,
};

export default FilterTag;
