import React from 'react';
import copy from 'copy-to-clipboard';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../../common/sttm-ui/icon';
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
    <section className="settings-group overlay-url">
      <h4 className="settings-group__title">{i18n.t(`BANI_OVERLAY.LIVE_URL`)}</h4>
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
        <PrimaryButton
          variant="outline"
          mode="icon"
          size="sm"
          shape="circle"
          aria-label={i18n.t('BANI_OVERLAY.COPY_URL')}
          onClick={handleCopy}
          onMouseLeave={() => setCopied(false)}
        >
          <Icon name="copy" />
        </PrimaryButton>
      </div>
      <span className="url-status">
        {copied ? i18n.t('BANI_OVERLAY.COPIED_URL') : i18n.t('BANI_OVERLAY.COPY_URL')}
      </span>
    </section>
  );
};
