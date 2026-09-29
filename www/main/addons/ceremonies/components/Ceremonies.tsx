import React from 'react';

import CeremonyPane from './CeremonyPane';
import useLoadCeremonies from '../hooks/use-load-ceremonies';
import { Overlay } from '../../../common/sttm-ui';
import { ceremoniesFilter } from '../../../common/constants';

type CeremoniesProps = {
  onScreenClose: (event?: React.MouseEvent<HTMLElement>) => void;
};

// The ceremonies, one card each, like the Settings overlay's categories.
const Ceremonies = ({ onScreenClose }: CeremoniesProps) => {
  const { isLoadingCeremonies, ceremonies } = useLoadCeremonies();

  const visibleCeremonies =
    ceremonies.length > 0
      ? ceremoniesFilter.visible.map((cId) => ceremonies.find((c) => c.id === cId)!)
      : [];

  return (
    <Overlay onScreenClose={onScreenClose}>
      <div className="addon-wrapper ceremonies-wrapper">
        {isLoadingCeremonies && <div className="sttm-loader" />}
        {!isLoadingCeremonies &&
          visibleCeremonies.map((c) => (
            <CeremonyPane key={c.token} {...c} onScreenClose={onScreenClose} />
          ))}
      </div>
    </Overlay>
  );
};

export default Ceremonies;
