import { settingsObjGenerator } from '../../common/utils/settings-obj-generator';
import overlayConfig from '../../../configs/overlay.json';

const { sidebar, bottomBar } = overlayConfig;

export const settingsObj = settingsObjGenerator(sidebar);
export const bottomSettings = settingsObjGenerator(bottomBar);
