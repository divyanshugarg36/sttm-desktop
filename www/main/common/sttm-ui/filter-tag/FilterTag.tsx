import React from 'react';
import Icon from '../icon';

type FilterTagProps = {
  close: React.MouseEventHandler<HTMLSpanElement>;
  title: string;
  filterType: string;
};

const FilterTag = ({ close, title, filterType }: FilterTagProps) => (
  <div className="filter-tag" title={filterType}>
    <span className="filter-tag--remove" onClick={close}>
      <Icon name="x" />
    </span>
    <span className="filter-tag--title">{title}</span>
  </div>
);

export default FilterTag;
