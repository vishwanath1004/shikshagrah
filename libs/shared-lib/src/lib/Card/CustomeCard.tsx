/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { Card, CardContent, Box, Typography } from '@mui/material';

export const DynamicCard = ({ title, icon, onClick }) => {
  const isImage = typeof icon === 'string' && icon.startsWith('/'); // Check if it's an image path

  return (
    <Card
      sx={{
        width: { xs: '110px', sm: '200px' },
        minHeight: { xs: 150, sm: 180 }, // Fixed minimum height
        height: { xs: 150, sm: 180 },
        // Ensuring fixed height
        textAlign: 'center',
        padding: 1.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Centering content
        alignItems: 'center',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          fontSize: 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 1.5,
        }}
      >
        {isImage ? (
          <img
            src={icon}
            alt={title}
            style={{ height: '75px', width: '75px' }}
          />
        ) : (
          icon
        )}
      </Box>
      <CardContent sx={{ paddingBottom: '8px !important' }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontSize: '20px' }}
          sm={{ fontSize: '25px' }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};
