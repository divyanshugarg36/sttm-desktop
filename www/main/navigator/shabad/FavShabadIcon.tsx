import React, { useEffect, useRef, useState } from 'react';

import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import classNames from '../../common/utils/classnames';
import { addToFav, fetchFavShabad, removeFromFav } from '../misc/utils';
import { setFavShabad } from '../../common/store/redux/navigatorSlice';
import { Icon } from '../../common/sttm-ui';
import { i18n } from '../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';

type FavShabadIconProps = {
  /** The Multi-Pane pane whose shabad it saves; the active shabad without one. */
  paneId?: number;
};

const FavShabadIcon = ({ paneId }: FavShabadIconProps) => {
  const [isLoading, setLoading] = useState(false);
  const favBtnRef = useRef<HTMLButtonElement>(null);
  const {
    activeShabadId,
    activeVerseId,
    favShabad,
    pane1,
    pane2,
    pane3,
    isSundarGutkaBani,
    isCeremonyBani,
  } = useAppSelector((state) => state.navigator);
  const { currentWorkspace } = useAppSelector((state) => state.userSettings);

  const dispatch = useAppDispatch();

  const userToken = useAppSelector((state) => state.app.userToken);

  const [currentShabad, setCurrentShabad] = useState<number | string | null>(activeShabadId);
  const [currentVerse, setCurrentVerse] = useState<number | ''>(activeVerseId);
  const [favShabadIndex, setFavShabadIndex] = useState(-1);
  const [baniType, setBaniType] = useState('');

  useEffect(() => {
    if (paneId) {
      switch (paneId) {
        case 1:
          setCurrentShabad(pane1.activeShabad);
          setCurrentVerse(pane1.activeVerse);
          setBaniType(pane1.baniType);
          break;
        case 2:
          setCurrentShabad(pane2.activeShabad);
          setCurrentVerse(pane2.activeVerse);
          setBaniType(pane2.baniType);
          break;
        case 3:
          setCurrentShabad(pane3.activeShabad);
          setCurrentVerse(pane3.activeVerse);
          setBaniType(pane3.baniType);
          break;
        default:
          break;
      }
    } else {
      setCurrentShabad(activeShabadId);
      setCurrentVerse(activeVerseId);
    }
  }, [pane1, pane2, pane3, activeShabadId, activeVerseId]);

  useEffect(() => {
    const index = favShabad.findIndex((element) => element.shabad_id === currentShabad);
    setFavShabadIndex(index);
  }, [favShabad, currentShabad]);

  const toggleFavShabad = () => {
    setLoading(true);
    if (favShabadIndex < 0) {
      addToFav(currentShabad, currentVerse, userToken)
        .then(() => fetchFavShabad(userToken))
        .then((data) => {
          dispatch(setFavShabad([...data]));
          setLoading(false);
        });
    } else {
      removeFromFav(currentShabad, userToken)
        .then(() => fetchFavShabad(userToken))
        .then((data) => {
          dispatch(setFavShabad([...data]));
          setLoading(false);
        });
    }
  };

  if (
    baniType === 'shabad' ||
    (currentWorkspace !== i18n.t('WORKSPACES.MULTI_PANE') && !isSundarGutkaBani && !isCeremonyBani)
  ) {
    if (currentShabad && !isLoading && userToken) {
      return (
        <PrimaryButton
          className={classNames(
            'shabad-pane__fav',
            favShabadIndex >= 0 && 'shabad-pane__fav--saved',
          )}
          variant="ghost"
          mode="icon"
          size="xs"
          ref={favBtnRef}
          title={i18n.t('SHABAD_PANE.FAV_BTN_TOOLTIP')}
          onClick={toggleFavShabad}
        >
          <Icon name={favShabadIndex < 0 ? 'star' : 'star-solid'} />
        </PrimaryButton>
      );
    }
  }
  return null;
};

export default FavShabadIcon;
