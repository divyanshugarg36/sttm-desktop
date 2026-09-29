import React from 'react';
import bakePanktee from '../hooks/bakePanktee';
import type { UserSettingsState } from '../../common/store/redux/userSettingsSlice';
import type { GetFontSize, VishraamPlacement } from '../types';

type SlideGurbaniProps = {
  getFontSize?: GetFontSize;
  gurmukhiString?: string | null;
  larivaar?: boolean;
  vishraamPlacement?: VishraamPlacement;
  vishraamSource?: UserSettingsState['vishraamSource'] | '';
};

const SlideGurbani = ({
  getFontSize = () => undefined,
  gurmukhiString = '',
  larivaar = false,
  vishraamPlacement = {},
  vishraamSource = '',
}: SlideGurbaniProps) => {
  const useBakePanktee = bakePanktee();

  return (
    gurmukhiString && (
      <span className={larivaar ? 'larivaar' : 'padchhed'}>
        {useBakePanktee(getFontSize, vishraamPlacement, vishraamSource, gurmukhiString)}
      </span>
    )
  );
};

export default SlideGurbani;
