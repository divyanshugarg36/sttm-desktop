/**
 * sikhi-ui's SimpleSelect takes a flat option list, with no <optgroup>. This
 * flattens `[{ label, options: [{ id, text }] }]` groups into one list where
 * each group starts with a disabled heading option.
 */
export const toGroupedSelectOptions = (groups, { groupLabel, isDisabled = () => false }) =>
  groups
    .filter((group) => group.options.length)
    .flatMap((group) => [
      { value: `group:${group.label}`, label: `— ${groupLabel(group.label)} —`, disabled: true },
      ...group.options.map(({ id, text }) => ({
        value: id,
        label: text,
        disabled: isDisabled(id),
      })),
    ]);
