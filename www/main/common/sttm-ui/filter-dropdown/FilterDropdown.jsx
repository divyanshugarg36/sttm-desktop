import React from 'react';
import PropTypes from 'prop-types';
import { SimpleSelect } from '@khalisfoundation/sikhi-ui';

const FilterDropdown = ({ title, onChange, currentValue, optionsArray }) => (
  <SimpleSelect
    id={`dropdown-${title}`}
    className="select-bani-dd-group"
    variant="bordered"
    selectSize="sm"
    shape="pill"
    aria-label={title}
    title={title}
    onChange={onChange}
    value={currentValue}
    options={optionsArray.map((option) => ({ value: option.value, label: option.text }))}
  />
);

FilterDropdown.propTypes = {
  title: PropTypes.string,
  onChange: PropTypes.func,
  optionsArray: PropTypes.array,
  currentValue: PropTypes.string,
};

export default FilterDropdown;
