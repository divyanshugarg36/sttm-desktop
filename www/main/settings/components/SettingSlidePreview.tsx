import React, { useEffect, useState } from 'react';
import { PresenterSlide, type PresenterLine } from '@khalisfoundation/sikhi-ui';

import themes from '../../../configs/themes.json';
import { useAppSelector } from '../../common/store/redux/hooks';
import { toPresenterSettings } from '../../viewer/Slide/presenter-settings';

const PREVIEW_WIDTH = 500;
const PREVIEW_HEIGHT = 280;

// The sample line, with each language the content rows can show.
const translation = 'Whatever I ask for from my Lord and Master, he gives that to me.';
const teeka =
  'hy BweI! pRBU dy dws Awpxy pRBU pwsoN jo kuJ mMgdy hn auh auhI kuJ auhnW ƒ dyNdw hY [';
const visraams = [{ p: 4, t: 'v' }];

const SAMPLE_LINE: PresenterLine = {
  id: 0,
  gurmukhi: 'jo mwgih Twkur Apuny qy soeI soeI dyvY ]',
  visraams: { sttm: visraams, sttm2: visraams, igurbani: visraams },
  translations: {
    en: { bdb: translation, ms: translation, ssk: translation },
    es: { sn: 'Lo que sea que el Esclavo del Señor, Nanak recita con sus labios' },
    hi: { ss: 'हे भाई ! प्रभू के दास अपने प्रभू से जो कुछ माँगते हैं वह वही कुछ उनको देता है।' },
    pu: { bdb: teeka, ft: teeka, ms: teeka, ss: teeka },
  },
};

// The slide sizes itself in vh (the viewer's height): render it at the
// window's size and scale it down to the preview.
const useScale = () => {
  const [scale, setScale] = useState(() => PREVIEW_HEIGHT / window.innerHeight);
  useEffect(() => {
    const onResize = () => setScale(PREVIEW_HEIGHT / window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
};

/** The Settings preview: the viewer's slide (sikhi-ui PresenterSlide) in miniature. */
const SettingSlidePreview = () => {
  const userSettings = useAppSelector((state) => state.userSettings);
  const { theme, themeBg } = userSettings;
  const scale = useScale();

  const currentTheme = themes.find(({ key }) => key === theme);
  const isVideo = themeBg && themeBg.type === 'video';
  const background: React.CSSProperties = isVideo
    ? { background: currentTheme?.['background-color'] }
    : { backgroundImage: themeBg && themeBg.url ? `url(${themeBg.url})` : 'none' };

  return (
    <div className={`settings-slide-preview theme-${theme}`} style={background}>
      {isVideo && (
        <video className="video-preview" src={themeBg.url || undefined} autoPlay muted loop />
      )}
      <div
        className="settings-slide-preview__stage"
        style={{
          width: PREVIEW_WIDTH / scale,
          transform: `scale(${scale})`,
        }}
      >
        <PresenterSlide
          line={SAMPLE_LINE}
          nextLine={SAMPLE_LINE}
          settings={{ ...toPresenterSettings(userSettings), transitions: false }}
        />
      </div>
    </div>
  );
};

export default SettingSlidePreview;
