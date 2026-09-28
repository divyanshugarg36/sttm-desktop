import React from 'react';

import { i18n } from '../../../common/main-app';

type QrCodeProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

const QrCode = ({ canvasRef }: QrCodeProps) => (
  <div className="qr-container">
    <div className="qr-desc">{i18n.t('TOOLBAR.QR_CODE.DESC')}</div>
    <canvas ref={canvasRef} className="qr-bani-ctr" />
    <div className="qr-title">{i18n.t('TOOLBAR.BANI_CONTROLLER')}</div>
  </div>
);

export default QrCode;
