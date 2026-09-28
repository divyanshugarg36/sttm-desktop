import React from 'react';
import { ButtonCard } from '@khalisfoundation/sikhi-ui';

import { classNames, joinClasses } from '../../utils';

/** The parts of a theme (themes.json) a tile's swatch uses. */
type TileTheme = {
  key: string;
  'background-color'?: string;
  'background-image'?: string;
  'gurbani-color'?: string;
};

type TileProps = {
  children?: React.ReactNode;
  className?: string;
  theme?: TileTheme | null;
  type?: 'extras';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  content?: string;
  isEngTransliterated?: boolean;
};

const Tile = ({
  children,
  className,
  theme = null,
  type = 'extras',
  onClick,
  content,
  isEngTransliterated = false,
}: TileProps) => {
  const tileClassname = joinClasses([
    `${type}-tile`,
    theme ? `${theme.key}-tile` : null,
    className || null,
  ]);

  const getThemeSwatchStyles = (themeInstance: TileTheme) => ({
    backgroundColor: themeInstance['background-color'],
    backgroundImage: themeInstance['background-image']
      ? `url(assets/img/custom_backgrounds/${themeInstance['background-image']})`
      : 'none',
    color: themeInstance['gurbani-color'],
  });

  return (
    <ButtonCard
      onClick={onClick}
      className={`ui-tile ${tileClassname}`}
      style={theme ? getThemeSwatchStyles(theme) : undefined}
    >
      <span className={classNames(isEngTransliterated && 'eng-tile')}>{children || content}</span>
    </ButtonCard>
  );
};

export default Tile;
