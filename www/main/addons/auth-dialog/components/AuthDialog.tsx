import { ipcRenderer, shell } from 'electron';

import React, { useEffect, useState } from 'react';
import { Box, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import isOnline from 'is-online';

import { Icon, Overlay } from '../../../common/sttm-ui';
import { SP_API } from '../../../common/constants/api-urls';
import { useAppSelector } from '../../../common/store/redux/hooks';
import { analytics, i18n } from '../../../common/main-app';
import { sendToMain } from '../../../common/ipc';

/** The signed-in user, as the SikhiToTheMax API's /user returns it. */
interface UserInfo {
  firstname: string;
  email: string;
}

type AuthDialogProps = {
  onScreenClose: (event?: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

const AuthDialog = ({ onScreenClose, className }: AuthDialogProps) => {
  const userToken = useAppSelector((state) => state.app.userToken);
  const [userInfo, setUserInfo] = useState<UserInfo | ''>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const onlineValue = isOnline();
    onlineValue.then((data) => {
      setConnected(data);
    });
  }, []);

  const fetchInfo = async (): Promise<UserInfo> => {
    const response = await fetch(`${SP_API}/user`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    return response.json().then((data) => data);
  };

  useEffect(() => {
    fetchInfo().then((data) => {
      setUserInfo(data);
    });
  }, [userToken]);

  return (
    <Overlay onScreenClose={onScreenClose} className={className}>
      <div className="addon-wrapper sync-wrapper overlay-ui ui-sync-button auth-wrapper">
        {connected ? (
          <div className="sync overlay-ui ui-sync-button">
            <header className="sync-header">
              {userToken ? i18n.t('AUTH.LOGOUT_LABEL') : i18n.t('AUTH.LOGIN_LABEL')}
            </header>
            <Box variant="gradient" className="sync-content-wrapper">
              <div className="sync-content auth-content">
                <h1>
                  {userInfo
                    ? i18n.t('AUTH.LOGGED_IN_GREETING', { firstName: userInfo.firstname })
                    : i18n.t('AUTH.LOGIN_LABEL')}
                </h1>
                <p>
                  {userInfo
                    ? i18n.t('AUTH.LOGGED_IN_DESC', { email: userInfo.email })
                    : i18n.t('AUTH.LOGIN_DESC')}
                </p>
                {userToken ? (
                  <PrimaryButton
                    className="auth-button logout-button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon name="logout" />}
                    onClick={async () => {
                      analytics.trackEvent({
                        category: 'User Authentication',
                        action: 'Logout',
                        label: 'Logout',
                        value: 'logged out',
                      });
                      ipcRenderer.emit('userToken', '');
                      sendToMain('deleteToken');
                      setUserInfo('');
                      onScreenClose();
                    }}
                  >
                    {i18n.t('AUTH.LOGOUT_LABEL')}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    className="auth-button login-button"
                    size="sm"
                    leftIcon={<Icon name="login" />}
                    onClick={() => {
                      analytics.trackEvent({
                        category: 'User Authentication',
                        action: 'Login',
                        label: 'Login',
                        value: 'logged in',
                      });
                      shell.openExternal(`${SP_API}/login/sso`);
                    }}
                  >
                    {i18n.t('AUTH.LOGIN_LABEL')}
                  </PrimaryButton>
                )}
              </div>
            </Box>
          </div>
        ) : (
          <div className="sync overlay-ui ui-sync-button">
            <header className="sync-header">{i18n.t('AUTH.LOGIN_LABEL')}</header>
            <Box variant="gradient" className="sync-content-wrapper">
              <div className="sync-content auth-content">
                <p>{i18n.t('AUTH.INTERNET_ERR')}</p>
              </div>
            </Box>
          </div>
        )}
      </div>
    </Overlay>
  );
};

export default AuthDialog;
