import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useRouter, usePathname } from 'next/navigation';
export const Footer: React.FC = () => {
  const [value, setValue] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  // Map paths to their corresponding tab values
  const pathToValueMap = {
    '/home': 0,
    '/content': 1,
    '/ml/project-downloads': 2,
    '/profile': 3,
  };
  const updateTabValue = (currentPath: string) => {
    // Find the current value based on exact path matches first
    const currentValue =
      pathToValueMap[currentPath as keyof typeof pathToValueMap];
    if (currentValue !== undefined) {
      setValue(currentValue);
    } else {
      // Fallback to startsWith check for nested routes
      if (
        currentPath.startsWith('/content') ||
        currentPath?.startsWith('/player')
      ) {
        setValue(1);
      } else if (currentPath.startsWith('/ml/project-downloads')) {
        setValue(2);
      } else if (currentPath.startsWith('/profile')) {
        setValue(3);
      } else if (currentPath === '/' || currentPath === '') {
        // Default to home for root path
        setValue(0);
      }
    }
  };
  // Initial check on component mount
  useEffect(() => {
    const currentPath = window.location.pathname;
    updateTabValue(currentPath);
  }, []);
  useEffect(() => {
    // Update based on Next.js pathname
    updateTabValue(pathname);
    // Also listen to actual browser URL changes for external navigation
    const handleUrlChange = () => {
      const currentPath = window.location.pathname;
      updateTabValue(currentPath);
    };
    // Listen to popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    // Listen to window focus events (when user comes back from external page)
    const handleWindowFocus = () => {
      const currentPath = window.location.pathname;
      updateTabValue(currentPath);
    };
    window.addEventListener('focus', handleWindowFocus);
    // Also check URL on mount and periodically to catch external navigation
    const checkUrlInterval = setInterval(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== pathname) {
        updateTabValue(currentPath);
      }
    }, 500);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(checkUrlInterval);
    };
  }, [pathname]);
  const handleNavigation = (path: string) => {
    // Check if it's a full URL
    if (path.startsWith('http')) {
      window.location.href = path;
      return;
    }
    const absolutePath = path.startsWith('/') ? path : `/${path}`;
    window.location.href = absolutePath;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (value !== newValue) {
      setValue(newValue);
      switch (newValue) {
        case 0:
          handleNavigation('/home');
          break;
        case 1:
          handleNavigation('/content/content');
          break;
        case 2:
          handleNavigation('/ml/project-downloads');
          break;
        case 3:
          handleNavigation('/profile');
          break;
        default:
          break;
      }
    }
  };
  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        zIndex: 10,
        marginLeft: '-8px',
        borderTop: '5px solid #FFD580',
        borderRadius: '25px 25px 0 0',
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          borderBottom: '2px solid #FFD580',
          boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)',
          backgroundColor: '#FFF7E6',
          borderRadius: '25px 25px 0 0',
          '& .Mui-selected': {
            color: '#FF9911',
          },
          '& .MuiBottomNavigationAction-root': {
            color: 'black',
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={
            <HomeIcon
              sx={{
                fontSize: value === 0 ? '2rem' : '1.5rem',
                transition: 'transform 0.3s ease, color 0.3s ease',
                transform: value === 0 ? 'scale(1.2)' : 'scale(1)',
                color: value === 0 ? '#582E92' : 'inherit',
              }}
            />
          }
        />
        <BottomNavigationAction
          label="Content"
          icon={
            <DescriptionIcon
              sx={{
                fontSize: value === 1 ? '2rem' : '1.5rem',
                transition: 'transform 0.3s ease, color 0.3s ease',
                transform: value === 1 ? 'scale(1.2)' : 'scale(1)',
                color: value === 1 ? '#582E92' : 'inherit',
              }}
            />
          }
        />
        <BottomNavigationAction
          label="Downloads"
          icon={
            <ArrowDownwardIcon
              sx={{
                fontSize: value === 2 ? '2rem' : '1.5rem',
                transition: 'transform 0.3s ease, color 0.3s ease',
                transform: value === 2 ? 'scale(1.2)' : 'scale(1)',
                color: value === 2 ? '#582E92' : 'inherit',
              }}
            />
          }
        />
        <BottomNavigationAction
          label="Profile"
          icon={
            <AccountCircleIcon
              sx={{
                fontSize: value === 3 ? '2rem' : '1.5rem',
                transition: 'transform 0.3s ease, color 0.3s ease',
                transform: value === 3 ? 'scale(1.2)' : 'scale(1)',
                color: value === 3 ? '#582E92' : 'inherit',
              }}
            />
          }
        />
      </BottomNavigation>
    </Box>
  );
};
