import type { SimpleSelectOption } from '@khalisfoundation/sikhi-ui';

/** A labelled group of options, e.g. a BaniOptionGroup. */
interface OptionGroup {
  label: string;
  options: { id: string; text: string }[];
}

interface GroupedSelectConfig {
  /** The heading shown for a group, given its label. */
  groupLabel: (label: string) => string;
  isDisabled?: (id: string) => boolean;
}

/**
 * sikhi-ui's SimpleSelect takes a flat option list, with no <optgroup>. This
 * flattens `[{ label, options: [{ id, text }] }]` groups into one list where
 * each group starts with a disabled heading option.
 */
export const toGroupedSelectOptions = (
  groups: OptionGroup[],
  { groupLabel, isDisabled = () => false }: GroupedSelectConfig,
): SimpleSelectOption[] =>
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
