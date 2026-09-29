import { SP_API } from '../../../common/constants/api-urls';
import { analytics } from '../../../common/main-app';
import type { FavouriteShabad } from '../../../common/store/redux/navigatorSlice';

export const fetchFavShabad = async (userToken: string): Promise<FavouriteShabad[]> => {
  const response = await fetch(`${SP_API}/favourite-shabads`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return response.json().then((data) => data.favouriteShabads);
};

export const addToFav = async (
  shabadId: number | string | null,
  verseId: number | '',
  userToken: string,
) => {
  analytics.trackEvent({
    category: 'Favourite Shabad',
    action: 'Add',
    label: 'shabadId',
    value: shabadId,
  });
  await fetch(`${SP_API}/favourite-shabads`, {
    method: 'POST',
    body: JSON.stringify({
      shabadId,
      verseId,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
  });
};

export const removeFromFav = async (shabadId: number | string | null, userToken: string) => {
  analytics.trackEvent({
    category: 'Favourite Shabad',
    action: 'Remove',
    label: 'shabadId',
    value: shabadId,
  });
  await fetch(`${SP_API}/favourite-shabads/${shabadId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
};
