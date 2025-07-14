/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Menu, MenuItem } from '@mui/material';
interface ActionIcon {
  icon: React.ReactNode;
  ariaLabel: string;
  anchorEl?: HTMLElement | null;
  onLogoutClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onOptionClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLLIElement, MouseEvent>
  ) => void;
}
interface ProfileIcon {
  icon: React.ReactNode;
  ariaLabel: string;
  anchorEl?: HTMLElement | null;
  onLogoutClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}
interface CommonAppBarProps {
  title?: string;
  showMenuIcon?: boolean;
  showBackIcon?: boolean;
  menuIconClick?: () => void;
  backIconClick?: () => void;
  actionButtonLabel?: string;
  actionButtonClick?: () => void;
  actionButtonColor?: 'inherit' | 'primary' | 'secondary' | 'default';
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
  color?: 'primary' | 'secondary' | 'default' | 'transparent' | 'inherit';
  actionIcons?: ActionIcon[];
  profileIcon?: ProfileIcon[];
  bgcolor?: string;
  onMenuClose?: () => void;
  onOptionClick?: () => void;
}

export const TopAppBar: React.FC<CommonAppBarProps> = ({
  title = 'Title',
  showMenuIcon = true,
  showBackIcon = false,
  menuIconClick,
  backIconClick,
  onMenuClose,
  onOptionClick,
  actionButtonLabel = 'Action',
  actionButtonClick,
  actionButtonColor = 'inherit',
  position = 'static',
  color = 'transparent',
  actionIcons = [],
  profileIcon = [],
  bgcolor = '#FF9911',
}) => {
  const accountIcon = actionIcons.find((icon) => icon.ariaLabel === 'Account');
  console.log('showBackIcon', showBackIcon);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ minHeight: '64px' }} />
      <AppBar
        component="nav"
        sx={{
          borderBottom: '2px solid #FFD580', // Light shade of #FF9911 for the bottom border
          boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)', // Subtle shadow
          backgroundColor: '#FFF7E6', // Light background derived from #FF9911
          borderRadius: '0 0 25px 25px',
          color: '#572E91', // Rounded corners only on the bottom left and right
        }}
      >
        <Toolbar>
          {/* {showMenuIcon && ( */}
          <>
            {/* <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={menuIconClick}
              >
                <MenuIcon />
              </IconButton> */}
            {showBackIcon && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="back"
                onClick={backIconClick}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography
              component="div"
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>
          </>
          {/* )} */}

          {profileIcon && profileIcon.length > 0 && (
            <IconButton
              color={actionButtonColor}
              aria-label={profileIcon[0]?.ariaLabel}
              onClick={profileIcon[0]?.onLogoutClick}
            >
              {profileIcon[0].icon}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      {profileIcon[0]?.anchorEl && (
        <Menu
          id="menu-appbar"
          anchorEl={profileIcon[0].anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(profileIcon[0].anchorEl)}
          onClose={onMenuClose}
        >
          {actionIcons?.map((action, index) => (
            <MenuItem key={index} onClick={action?.onOptionClick}>
              <IconButton size="small" color="inherit">
                {action.icon}
              </IconButton>
              {action.ariaLabel}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Box>
  );
};
