import React, { useRef, useEffect } from 'react';
import { getTelemetryEvents } from '../../services/TelemetryService';

interface PlayerProps {
  playerConfig: any;
  relatedData?: any;
  configFunctionality?: boolean;
}

const basePath = process.env.NEXT_PUBLIC_ASSETS_CONTENT || '/sbplayer';

const V1Player = ({
  playerConfig,
  relatedData: { courseId, unitId, userId },
  configFunctionality,
}: PlayerProps) => {
  const previewRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const preview: any = previewRef.current;

    if (preview) {
      const originalSrc = preview.src;
      preview.src = '';
      preview.src = originalSrc;

      const handleLoad = () => {
        setTimeout(() => {
          if (
            preview.contentWindow &&
            preview.contentWindow.initializePreview
          ) {
            preview.contentWindow.initializePreview(playerConfig);
          }

          preview.addEventListener(
            'renderer:telemetry:event',
            async (event: any) => {
              console.log('V1 player telemetry event ===>', event);
              if (event.detail.telemetryData.eid === 'START') {
                console.log('V1 player telemetry START event ===>', event);
              }
              if (event.detail.telemetryData.eid === 'END') {
                console.log('V1 player telemetry END event ===>', event);
              }

              await getTelemetryEvents(event.detail.telemetryData, 'v1', {
                courseId,
                unitId,
                userId,
                configFunctionality,
              });
            }
          );
        }, 100);
      };

      preview.addEventListener('load', handleLoad);

      return () => {
        preview.removeEventListener('load', handleLoad);

        // Reset iframe to prevent residual styles or memory leaks
        // Commenting below code - Content Preview is only work due to below code
        // if (preview) {
        //   preview.src = "";
        // }
      };
    }
  }, [playerConfig]);

  return (
    <div
      style={{
        position: 'fixed', // Changed from flex to fixed positioning
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5', // Optional background
      }}
    >
      <iframe
        ref={previewRef}
        id="contentPlayer"
        title="Content Player"
        src={`${basePath}/libs/sunbird-content-player/preview/preview.html?webview=true`}
        aria-label="Content Player"
        style={{
          border: 'none',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '70%',
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
        width={'70%'}
        height={'70%'}
        scrolling="no"
      ></iframe>
    </div>
  );
};

export default V1Player;
