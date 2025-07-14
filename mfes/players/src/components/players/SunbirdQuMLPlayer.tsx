import 'reflect-metadata';
import React, { useEffect, useRef } from 'react';
// import axios from 'axios';
import { handleTelemetryEventQuml } from '../../services/TelemetryService';
import { handleExitEvent } from '../utils/Helper';
import { createAssessmentTracking } from '../../services/PlayerService';

interface PlayerConfigProps {
  playerConfig: any;
  relatedData?: any;
  configFunctionality?: boolean;
}

const basePath = process.env.NEXT_PUBLIC_ASSETS_CONTENT || '/sbplayer';

const SunbirdQuMLPlayer = ({
  playerConfig,
  relatedData: { courseId, unitId, userId },
  configFunctionality,
}: PlayerConfigProps) => {
  const SunbirdQuMLPlayerRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const playerElement: any = SunbirdQuMLPlayerRef.current;
    if (playerElement) {
      const originalSrc = playerElement.src;
      playerElement.src = '';
      playerElement.src = originalSrc;

      const handleLoad = async () => {
        // console.log(
        //   'playerConfig',
        //   playerConfig?.metadata?.children,
        //   playerConfig?.metadata?.children.map((child: any) => child.identifier)
        // );

        // if (playerConfig?.metadata?.children) {
        // const { data } = await axios.post(
        //   `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/api/question/v2/list`,
        //   {
        //     request: {
        //       search: {
        //         identifier: playerConfig?.metadata?.children.map(
        //           (child: any) => child.identifier
        //         ),
        //       },
        //     },
        //   }
        // );
        // localStorage.setItem(
        //   'questions_data',
        //   JSON.stringify({ questions_data: data })
        // );
        // console.log(data, 'result');
        // }
        setTimeout(() => {
          if (
            playerElement.contentWindow &&
            playerElement.contentWindow.setData
          ) {
            playerElement.contentWindow?.localStorage.setItem(
              'questions_data',
              JSON.stringify({ questions_data: { result: { questions: [] } } })
            );
            playerElement.contentWindow?.localStorage.setItem(
              'qumlPlayerObject',
              JSON.stringify({
                qumlPlayerConfig: playerConfig,
                questionListUrl: `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/api/question/v2/list`,
              })
            );

            playerElement.contentWindow.setData(playerConfig);
          }
        }, 200);
      };

      playerElement.addEventListener('load', handleLoad);

      return () => {
        playerElement.removeEventListener('load', handleLoad);
      };
    }
  }, [playerConfig]);

  React.useEffect(() => {
    const handleMessage = (event: any) => {
      const data = JSON.parse(event?.data);
      if (data?.maxScore !== undefined) {
        createAssessmentTracking({
          ...data,
          courseId,
          unitId,
          userId,
        });
      } else if (data?.data?.edata?.type === 'EXIT') {
        handleExitEvent();
      } else if (data?.data?.mid) {
        handleTelemetryEventQuml(data, {
          courseId,
          unitId,
          userId,
          configFunctionality,
        });
      }
    };

    window.addEventListener('message', handleMessage, false);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <iframe
      ref={SunbirdQuMLPlayerRef}
      id="contentPlayer"
      title="Content Player"
      src={`${basePath}/libs/sunbird-quml-player/index.html`}
      aria-label="Content Player"
      style={{ border: 'none' }}
      width={'100%'}
      height={'100%'}
    ></iframe>
  );
};

export default SunbirdQuMLPlayer;
