'use client';
import { useRouter } from 'next/router';
import React from 'react';
import { Layout } from '@shared-lib';

interface PlayerPageProps {
  id?: string; // Define the type for the 'id' prop
}

const PlayerPage: React.FC<PlayerPageProps> = ({ id }) => {
  const router = useRouter();
  const { identifier, courseId, unitId } = router.query; // Access the identifier from the URL
  console.log('Router Query:', identifier);
  if (!identifier) {
    return <div>Loading...</div>;
  }
  console.log(
    'URL=>>>',
    `${process.env.NEXT_PUBLIC_LEARNER_SBPLAYER}?identifier=${identifier}${
      courseId && unitId ? `&courseId=${courseId}&unitId=${unitId}` : ''
    }`
  );
  const onBackClick = () => {
    router.back();
  };
  return (
    <Layout
      showTopAppBar={{
        title: '',
        showMenuIcon: true,
        showBackIcon: true,
        backIconClick: onBackClick,
      }}
      isFooter={true}
      showLogo={true}
      showBack={true}
    >
      <iframe
        src={`${
          process.env.NEXT_PUBLIC_LEARNER_SBPLAYER
        }?identifier=${identifier}${
          courseId && unitId ? `&courseId=${courseId}&unitId=${unitId}` : ''
        }`}
        style={{
          border: 'none',
          height: 'calc(100vh - 20px)',
        }}
        width="100%"
        height="100%"
        title="Embedded Localhost"
      />
    </Layout>
  );
};

export default PlayerPage;
