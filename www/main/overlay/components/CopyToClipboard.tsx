import React from 'react';
import copy from 'copy-to-clipboard';
import { Icon } from '../../common/sttm-ui';
import { i18n } from '../../common/main-app';

type CopyToClipboardProps = {
  url: string;
};

export const CopyToClipboard = ({ url }: CopyToClipboardProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    copy(url);
    setCopied(true);
  };

  return (
    <div className="overlay-url">
      <p className="overlay-window-text live-url-header">{i18n.t(`BANI_OVERLAY.LIVE_URL`)}</p>
      <div className="url-container">
        <input
          type="text"
          className="url-text"
          onClick={handleCopy}
          onFocus={(event) => event.target.select()} // Select all text on focus
          onMouseLeave={() => setCopied(false)}
          readOnly={true}
          value={url}
        />
        <span className="export-btn" onClick={handleCopy} onMouseLeave={() => setCopied(false)}>
          <Icon name="copy" className="cp-icon" />
        </span>
        <span className="tooltip">
          {copied ? i18n.t('BANI_OVERLAY.COPIED_URL') : i18n.t('BANI_OVERLAY.COPY_URL')}
        </span>
      </div>
    </div>
  );
};
