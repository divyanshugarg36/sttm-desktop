import React, { useEffect, useState } from 'react';
import { ButtonCard, CloseButton, Dialog, PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { i18n } from '../common/main-app';

// Cast receivers that can't show slides (audio-only speakers and groups).
const UNSUPPORTED = /Chromecast-Audio|Google-Home|Sound-Bar|Google-Cast-Group/;

// A device to pick, or (with no resolve) a message such as a cast error.
type PickRequest = {
  receivers: ChromecastReceiver[];
  resolve?: (receiver: ChromecastReceiver) => void;
  message?: string;
};

// The mounted picker's setter; pickCastDevice goes through it.
let openPicker: ((request: PickRequest | null) => void) | null = null;

/**
 * Asks which cast device to use, from those found. Resolves with the chosen
 * one; closing the picker leaves it pending, so nothing is cast.
 */
export const pickCastDevice = (receivers: ChromecastReceiver[]) =>
  new Promise<ChromecastReceiver>((resolve) => {
    openPicker?.({ receivers, resolve });
  });

/** Shows a cast message (e.g. an error) in the picker's dialog. */
export const showCastMessage = (message: string) => {
  openPicker?.({ receivers: [], message });
};

/** The cast device picker (a sikhi-ui Dialog), opened by pickCastDevice. */
export const CastDevicePicker = () => {
  const [request, setRequest] = useState<PickRequest | null>(null);

  useEffect(() => {
    openPicker = setRequest;
    return () => {
      openPicker = null;
    };
  }, []);

  const close = () => setRequest(null);

  useEffect(() => {
    if (!request) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [request]);

  const receivers = (request?.receivers ?? []).filter(
    (receiver) => receiver.friendlyName && !UNSUPPORTED.test(receiver.service_fullname),
  );

  return (
    <Dialog
      isOpen={!!request}
      onClose={close}
      variant="gradient"
      className="cast-picker"
      headerRight={<CloseButton onClick={close} />}
      headerLeft={
        <h2 className="cast-picker__title">
          {request?.message ??
            (receivers.length
              ? i18n.t('CHROMECAST.SELECT_DEVICE')
              : i18n.t('CHROMECAST.NO_DEVICES_FOUND'))}
        </h2>
      }
    >
      {receivers.length > 0 && (
        <div className="cast-picker__devices">
          {receivers.map((receiver) => (
            <ButtonCard
              key={`${receiver.ipAddress}_${receiver.port}`}
              className="cast-picker__device"
              onClick={() => {
                request!.resolve?.(receiver);
                close();
              }}
            >
              {receiver.friendlyName}
            </ButtonCard>
          ))}
        </div>
      )}
      <div className="cast-picker__actions">
        <PrimaryButton variant="outline" size="sm" onClick={close}>
          {receivers.length ? i18n.t('CHROMECAST.CANCEL') : 'OK'}
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
