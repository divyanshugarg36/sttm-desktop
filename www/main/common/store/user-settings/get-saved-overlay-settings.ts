import convertObjToCamelCase from '../../utils/convert-object-to-camel-case';

import { savedSettings } from './get-saved-user-settings';
import overlayConfig from '../../../../configs/overlay.json';

const { sidebar, bottomBar } = overlayConfig;

const settings: Record<string, { initialValue?: unknown }> = {
  ...sidebar.settings,
  ...bottomBar.settings,
};

/** The saved settings, with the bani overlay's under `baniOverlay`. */
type SavedWithOverlay = Record<string, unknown> & { baniOverlay?: Record<string, unknown> };

export const getDefaultSettings = () => {
  const defaultSettings: Record<string, unknown> = {};
  Object.keys(settings).forEach((key) => {
    defaultSettings[key] = settings[key].initialValue;
  });
  return convertObjToCamelCase(defaultSettings);
};

const getOverlaySettings = (): SavedWithOverlay & { baniOverlay: Record<string, unknown> } => {
  const saved = savedSettings as SavedWithOverlay;
  if (saved.baniOverlay) {
    return saved as SavedWithOverlay & { baniOverlay: Record<string, unknown> };
  }
  const defaultSettings: Record<string, unknown> = {};
  Object.keys(settings).forEach((key) => {
    defaultSettings[key] = settings[key].initialValue;
  });
  saved.baniOverlay = defaultSettings;
  return saved as SavedWithOverlay & { baniOverlay: Record<string, unknown> };
};

export const savedOverlaySettings = getOverlaySettings();

export const overlaySettingsCamelCase = () => {
  const newObj = convertObjToCamelCase(savedOverlaySettings.baniOverlay);
  savedOverlaySettings.baniOverlay = newObj;
  return convertObjToCamelCase(savedOverlaySettings);
};
