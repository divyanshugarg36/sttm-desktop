import React from 'react';
import moment from 'moment';
import { showAppDialog } from './common/sttm-ui';
import { i18n } from './common/main-app';

/** A message from the desktop notifications API. */
export interface NotificationRow {
  Created: string;
  Title: string;
  Content: string;
}

// format the date default to "Month Day, Year"
const formatDate = (dateString: string, format = 'LL') => moment(dateString).format(format);

const stripScripts = (string: string) => {
  const div = document.createElement('div');
  div.innerHTML = string;
  const scripts = div.getElementsByTagName('script');
  let i = scripts.length;
  while (i > 0) {
    i -= 1;
    scripts[i].parentNode!.removeChild(scripts[i]);
  }
  return div.innerHTML;
};

const scriptTagCheckRegEx = /<[^>]*script/i;

const parseContent = (contentString: string) => {
  if (scriptTagCheckRegEx.test(contentString)) {
    return stripScripts(contentString); // this might be overkill.
  }
  return contentString;
};

/** The "What's New" messages, newest as sent, in the app dialog. */
export const showNotificationsDialog = (rows: NotificationRow[]) =>
  showAppDialog({
    title: i18n.t('OTHERS.WHATS_NEW'),
    className: 'notifications-dialog',
    body: (
      <div className="notifications-dialog__list">
        {rows.map((item, index) => (
          <article key={index} className="notifications-dialog__item">
            <span className="notifications-dialog__date">{formatDate(item.Created)}</span>
            <h3 className="notifications-dialog__heading">{item.Title}</h3>
            <div
              className="notifications-dialog__content"
              dangerouslySetInnerHTML={{ __html: parseContent(item.Content) }}
            />
          </article>
        ))}
      </div>
    ),
  });
