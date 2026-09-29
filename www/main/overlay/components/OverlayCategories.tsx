import React from 'react';

import OverlaySetting, { type OverlaySettingConfig } from './OverlaySetting';
import { convertToCamelCase } from '../../common/utils';
import { i18n } from '../../common/main-app';
import type { BaniOverlayState } from '../../common/store/redux/baniOverlaySlice';
import type {
  GeneratedCategory,
  GeneratedSubcategory,
} from '../../common/utils/settings-obj-generator';
import { useOverlaySelector } from '../store/hooks';

const control = (settingKey: string, settingObj: OverlaySettingConfig) => (
  <OverlaySetting
    key={settingKey}
    settingObj={settingObj}
    stateVar={convertToCamelCase(settingKey) as keyof BaniOverlayState}
    stateFunction={`set${convertToCamelCase(settingKey, true)}`}
  />
);

const settingRow = (key: string, title: string, controls: React.ReactNode) => (
  <div className="setting-row" key={key}>
    <div className="setting-row__label">
      <span className="setting-row__title">{title}</span>
    </div>
    <div className="setting-row__control">{controls}</div>
  </div>
);

type SubcategoryRowsProps = {
  subCategory: GeneratedSubcategory;
  /** Names the subcategory's untitled settings when it has no title itself. */
  fallbackTitle?: string;
  isToolbar: boolean;
};

// A subcategory's settings as setting rows: one with a title gets its own row;
// those without (e.g. Gurbani's colour, font and size) share a row named after
// the subcategory. In the bottom bar, just the controls.
const SubcategoryRows = ({ subCategory, fallbackTitle, isToolbar }: SubcategoryRowsProps) => {
  const { layout } = useOverlaySelector((state) => state.baniOverlay);
  const showFitText = ['top', 'bottom'].includes(layout);
  const settings = subCategory.settingObjs as Record<string, OverlaySettingConfig>;
  const keys = Object.keys(settings).filter(
    (key) => settings[key].type !== 'hidden' && (key !== 'fit-text-switch' || showFitText),
  );

  if (isToolbar) {
    return <>{keys.map((key) => control(key, settings[key]))}</>;
  }

  const untitled = keys.filter((key) => !settings[key].title);
  const rows: React.ReactNode[] = [];
  keys.forEach((key) => {
    if (settings[key].title) {
      rows.push(
        settingRow(key, i18n.t(`BANI_OVERLAY.${settings[key].title}`), control(key, settings[key])),
      );
    } else if (key === untitled[0]) {
      const title = subCategory.title || fallbackTitle;
      rows.push(
        settingRow(
          key,
          title ? i18n.t(`BANI_OVERLAY.${title}`) : '',
          untitled.map((untitledKey) => control(untitledKey, settings[untitledKey])),
        ),
      );
    }
  });
  return <>{rows}</>;
};

type OverlayCategoriesProps = {
  category: GeneratedCategory;
  isToolbar?: boolean;
};

const OverlayCategories = ({ category, isToolbar = false }: OverlayCategoriesProps) => (
  <>
    {Object.keys(category.subCatObjs).map((subCat) => (
      <SubcategoryRows
        key={subCat}
        subCategory={category.subCatObjs[subCat]}
        fallbackTitle={category.title}
        isToolbar={isToolbar}
      />
    ))}
  </>
);

export default OverlayCategories;
