import React from 'react';

import { i18n } from '../../../common/main-app';

type QrCodeProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

// The Bani Controller's QR code, beside what it's for. Always mounted: the
// code is drawn on its canvas once a sync code arrives.
const QrCode = ({ canvasRef }: QrCodeProps) => (
  <div className="setting-row sync-qr">
    <div className="setting-row__label">
      <span className="setting-row__title">{i18n.t('TOOLBAR.BANI_CONTROLLER')}</span>
      <span className="setting-row__note">{i18n.t('TOOLBAR.QR_CODE.DESC')}</span>
    </div>
    <div className="setting-row__control">
      <canvas ref={canvasRef} className="sync-qr__code" />
    </div>
  </div>
);

export default QrCode;
