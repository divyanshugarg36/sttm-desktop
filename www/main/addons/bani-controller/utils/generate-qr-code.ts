import { toast } from '@khalisfoundation/sikhi-ui';
import qrCode from 'qrcode';

import { i18n } from '../../../common/main-app';

const generateQrCode = (canvas: HTMLCanvasElement | null, syncCode: string | null) => {
  if (syncCode && canvas) {
    let url;
    if (process.env.NODE_ENV === 'development') {
      url = `http://dev.sikhitothemax.org/control/${syncCode}`;
    } else {
      url = `https://sttm.co/control/${syncCode}`;
    }
    qrCode.toCanvas(canvas, url, (error) => {
      if (error) {
        toast.error(`${i18n.t('TOOLBAR.QR_CODE.ERROR')} : ${error}`, { duration: 5000 });
      }
    });
  }
};

export default generateQrCode;
