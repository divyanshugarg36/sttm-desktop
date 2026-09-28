import getJSON from 'get-json';
import isOnline from 'is-online';

export const dailyHukamnama = (setIsHukamnamaLoading: (isLoading: boolean) => void) =>
  new Promise<number>((resolve, reject) => {
    isOnline().then((online) => {
      if (online) {
        setIsHukamnamaLoading(true);
        getJSON<{ shabadIds: string[] }>(
          'https://api.banidb.com/v2/hukamnamas/today',
          (error, response) => {
            if (!error) {
              const hukamShabadID = parseInt(response.shabadIds[0], 10);
              resolve(hukamShabadID);
            } else {
              reject();
            }
          },
        );
      }
    });
  });
