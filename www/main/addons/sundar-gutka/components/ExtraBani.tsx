import React from 'react';
import anvaad from 'anvaad-js';
import { Tile } from '../../../common/sttm-ui';
import type { NamedItem } from '../../utils/convert-db-proxy-to-array';

type ExtraBaniProps = {
  /** Which list it is, for its marker colour (as on the bani list). */
  tag: 'nitnem' | 'popular';
  title: string;
  banis?: NamedItem[];
  getBani: (event: React.MouseEvent, baniId: number) => void;
  isEngTransliterated?: boolean;
};

// A titled group (like a Settings group) of bani tiles.
const ExtraBani = ({
  tag,
  title,
  banis = [],
  getBani,
  isEngTransliterated = false,
}: ExtraBaniProps) => (
  <section className="settings-group">
    <h4 className="settings-group__title sundar-gutka__group-title">
      <span className={`sundar-gutka__tag sundar-gutka__tag--${tag}`} />
      {title}
    </h4>
    <div className="theme-picker__tiles sundar-gutka__tiles">
      {banis.map(({ id, name }) => (
        <Tile
          onClick={(e) => getBani(e, id)}
          key={name}
          className="sundar-gutka__tile"
          isEngTransliterated={isEngTransliterated}
        >
          {isEngTransliterated ? anvaad.translit(name) : anvaad.unicode(name)}
        </Tile>
      ))}
    </div>
  </section>
);

export default ExtraBani;
