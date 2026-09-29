import React from 'react';
import anvaad from 'anvaad-js';
import { Tile } from '../../../common/sttm-ui';
import { convertToHyphenCase } from '../../../common/utils';
import type { NamedItem } from '../../utils/convert-db-proxy-to-array';

type ExtraBaniProps = {
  title: string;
  banis?: NamedItem[];
  getBani: (event: React.MouseEvent, baniId: number) => void;
  isEngTransliterated?: boolean;
};

const ExtraBani = ({ title, banis = [], getBani, isEngTransliterated = false }: ExtraBaniProps) => {
  const hyphenedTitle = convertToHyphenCase(title.toLowerCase());
  const groupHeaderClassName = `${hyphenedTitle}-heading`;
  const groupClassName = hyphenedTitle;
  const groupItemClassName = hyphenedTitle.slice(0, -1); // removes last character from string.

  return (
    <div className="bani-group-container">
      <header className={`bani-group-heading ${groupHeaderClassName}`}>{title}</header>
      <div className={`bani-group ${groupClassName}`}>
        {banis.map(({ id, name }) => (
          <Tile
            onClick={(e) => {
              getBani(e, id);
            }}
            key={name}
            type="extras"
            className={groupItemClassName}
            isEngTransliterated={isEngTransliterated}
          >
            {isEngTransliterated ? anvaad.translit(name) : anvaad.unicode(name)}
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default ExtraBani;
