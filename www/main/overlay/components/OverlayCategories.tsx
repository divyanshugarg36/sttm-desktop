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

type SettingsFactoryProps = {
  subCategory: GeneratedSubcategory;
};

const SettingsFactory = ({ subCategory }: SettingsFactoryProps) => {
  const settingsDOM: React.ReactElement[] = [];
  const baniOverlayState = useOverlaySelector((state) => state.baniOverlay);
  const showFitTextOptions = ['top', 'bottom'].includes(baniOverlayState.layout);

  Object.keys(subCategory.settingObjs).forEach((settingKey, settingIndex) => {
    if (settingKey === 'fit-text-switch' && !showFitTextOptions) {
      return;
    }
    settingsDOM.push(
      <div
        className={`control-item control-${subCategory.settingObjs[settingKey].type}`}
        key={`factory-${settingIndex}`}
        id={settingKey}
      >
        <OverlaySetting
          settingObj={subCategory.settingObjs[settingKey] as OverlaySettingConfig}
          stateVar={convertToCamelCase(settingKey) as keyof BaniOverlayState}
          stateFunction={`set${convertToCamelCase(settingKey, true)}`}
        />
      </div>,
    );
  });
  return settingsDOM;
};

type OverlayCategoriesProps = {
  category: GeneratedCategory;
};

const OverlayCategories = ({ category }: OverlayCategoriesProps) => {
  const categoriesDOM: React.ReactElement[] = [];
  Object.keys(category.subCatObjs).forEach((subCat, scIndex) => {
    categoriesDOM.push(
      <div key={`control-${scIndex}`} className={`controls-container`} id={`settings-${subCat}`}>
        {category.subCatObjs[subCat].title && (
          <p className="subcategory-title">
            {i18n.t(`BANI_OVERLAY.${category.subCatObjs[subCat].title}`)}
          </p>
        )}
        <SettingsFactory subCategory={category.subCatObjs[subCat]} />
      </div>,
    );
  });

  return categoriesDOM;
};

export default OverlayCategories;
