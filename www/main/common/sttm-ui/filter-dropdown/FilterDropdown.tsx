import React from 'react';
import { SimpleSelect } from '@khalisfoundation/sikhi-ui';

/** A filter option: the value it sets and the text it shows. */
type FilterOption = { value: string; text: string };

type FilterDropdownProps = {
  title: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  optionsArray: FilterOption[];
  currentValue?: string;
};

const FilterDropdown = ({ title, onChange, currentValue, optionsArray }: FilterDropdownProps) => (
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

export default FilterDropdown;
