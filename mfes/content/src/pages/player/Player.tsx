'use client';
import { Box } from '@mui/material';
import { Layout } from '@shared-lib';
import { useParams } from 'next/navigation';
import React from 'react';
interface PlayerPageProps {
  id?: string; // Define the type for the 'id' prop
}
const PlayerPage: React.FC<PlayerPageProps> = ({ id }) => {
  const params = useParams();
  // const { identifier, courseId, unitId } = params; // string | string[] | undefined

  const identifier = params?.identifier ?? null;
  const courseId = params?.courseId ?? null;
  const unitId = params?.unitId ?? null;

  if (!identifier) {
    return <div>Loading...</div>;
  }

  return (
    <Layout
      showTopAppBar={{
        title: 'Player',
        showMenuIcon: false,
        showBackIcon: true,
      }}
      isFooter={true}
      showLogo={true}
      showBack={true}
    >
      <Box sx={{ mt: '6%', mb: '15%' }}>
        <iframe
          src={`${
            process.env.NEXT_PUBLIC_LEARNER_SBPLAYER
          }?identifier=${identifier}${
            courseId && unitId ? `&courseId=${courseId}&unitId=${unitId}` : ''
          }`}
          style={{
            // display: 'block',
            // padding: 0,
            border: 'none',
            height: 'calc(100vh - 60px)',
            marginBottom: '15%',
          }}
          width="100%"
          // height="100%"
          title="Embedded Localhost"
        />
      </Box>
    </Layout>
  );
};

export default PlayerPage;
