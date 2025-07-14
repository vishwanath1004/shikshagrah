import React, { useRef, useEffect } from 'react';
import { getTelemetryEvents } from '../../services/TelemetryService';
import { handleExitEvent } from '../utils/Helper';

interface PlayerConfigProps {
  playerConfig: any;
  relatedData?: any;
  configFunctionality?: any;
}

const basePath = process.env.NEXT_PUBLIC_ASSETS_CONTENT || '/sbplayer';

const SunbirdVideoPlayer = ({
  playerConfig,
  relatedData: { courseId, unitId, userId },
  configFunctionality,
}: PlayerConfigProps) => {
  const sunbirdVideoPlayerRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const playerElement: any = sunbirdVideoPlayerRef.current;
    if (playerElement) {
      const originalSrc = playerElement.src;
      playerElement.src = '';
      playerElement.src = originalSrc;

      const handleLoad = () => {
        setTimeout(() => {
          if (
            playerElement.contentWindow &&
            playerElement.contentWindow.setData
          ) {
            // playerElement.contentWindow.setData(playerConfig);
            const videoElement = document.createElement('sunbird-video-player');
            videoElement.setAttribute(
              'player-config',
              JSON.stringify(playerConfig)
            );
            videoElement.addEventListener('playerEvent', (event: any) => {
              if (event?.detail?.edata?.type === 'EXIT') {
                event.preventDefault();
                handleExitEvent();
              }
            });
            videoElement.addEventListener(
              'telemetryEvent',
              async (event: any) => {
                console.log('On telemetryEvent', event);
                try {
                  await getTelemetryEvents(event.detail, 'video', {
                    courseId,
                    unitId,
                    userId,
                    configFunctionality,
                  });
                } catch (error) {
                  console.error('Error submitting assessment:', error);
                }
              }
            );

            const myPlayer =
              playerElement.contentDocument.getElementById('my-player');
            if (myPlayer) {
              myPlayer.appendChild(videoElement);
            }
          }
        }, 200);
      };

      playerElement.addEventListener('load', handleLoad);

      return () => {
        playerElement.removeEventListener('load', handleLoad);
      };
    }
  }, [playerConfig]);

  return (
    <iframe
      ref={sunbirdVideoPlayerRef}
      id="contentPlayer"
      title="Content Player"
      src={`${basePath}/libs/sunbird-video-player/index.html`}
      aria-label="Content Player"
      style={{ border: 'none' }}
      width={'100%'}
      height={'100%'}
    ></iframe>
  );
};

export default SunbirdVideoPlayer;
