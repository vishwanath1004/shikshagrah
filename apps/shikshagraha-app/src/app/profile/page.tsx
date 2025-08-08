/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import {
  fetchProfileData,
  fetchLocationDetails,
  verifyOtp,
  deleteUser,
  myCourseDetails,
  renderCertificate,
  deleteUserAccount,
  resetUserPassword,
} from '../../services/ProfileService';
import {
  sendOtp,
  verifyOtpService,
  authenticateUser,
} from '../../services/LoginService';
import { Layout } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Grid,
  Avatar,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  DialogContentText,
  Card,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
  InputAdornment,
  Snackbar,
  Paper,
  TableBody,
  Link,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import OTPDialog from '../../Components/OTPDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Profile({ params }: { params: { id: string } }) {
  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userDataProfile, setUserDataProfile] = useState([
    { label: 'First Name', value: '' },
    { label: 'Middle Name', value: '' },
    { label: 'Last Name', value: '' },
    { label: 'Profile Type', value: '' },
  ]);
  const [userCustomFields, setUserCustomFields] = useState([]);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hashCode, setHashCode] = useState('');
  const [isOpenOTP, setIsOpenOTP] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mappedProfile, setMappedProfile] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [severity, setSeverity] = useState('');
  const [disableReset, setDisableReset] = useState(true);
  const [expandedFields, setExpandedFields] = useState({
    'Professional Role': false,
    'Professional Subrole': false,
  });

  useEffect(() => {
    const getProfileData = async () => {
      setLoading(true);
      try {
        const acc_token = localStorage.getItem('accToken');
        const userId = localStorage.getItem('userId');

        if (acc_token && userId) {
          const profileData = await fetchProfileData(userId, acc_token);
          console.log('Profile data:', profileData);
          if (profileData) {
            setUserData(profileData);
            const mappedProfileArray = [
              { label: 'State', value: profileData?.state?.label || '' },
              { label: 'District', value: profileData?.district?.label || '' },
              { label: 'Block', value: profileData?.block?.label || '' },
              { label: 'Cluster', value: profileData?.cluster?.label || '' },
              { label: 'School', value: profileData?.school?.label || '' },
              {
                label: 'Professional Role',
                value: profileData?.professional_role?.label || '',
              },
              {
                label: 'Professional Subrole',
                value:
                  profileData?.professional_subroles
                    ?.map((sub) => sub.label)
                    .join(', ') || '',
              },
            ];
            console.log('Mapped profile array:', mappedProfileArray);
            setMappedProfile(mappedProfileArray);
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, [router]);

  const handleMyCourses = async () => {
    const token = localStorage.getItem('accToken');
    if (token) {
      const userId = localStorage.getItem('userId');
      const detailsResponse = await myCourseDetails({
        token,
        userId,
      });
      setCourseDetails(detailsResponse?.result);
    }
  };

  const handleViewTest = async (certificateId: string) => {
    try {
      const response = await renderCertificate(certificateId);
      const responseData = JSON.parse(response);
      const certificateHtml = responseData?.result;

      const blob = new Blob([certificateHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error rendering certificate:', err);
    }
  };

  const handleAccountClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('accToken');
    localStorage.clear();
    clearIndexedDB();
    router.push('/');
  };

  function clearIndexedDB() {
    console.log('db clearing...');
    indexedDB
      .databases()
      .then((databases) => {
        console.log(databases);
        databases.forEach((database) => {
          const deleteRequest = indexedDB.deleteDatabase(database.name);

          deleteRequest.onsuccess = () => {
            console.log(`Database "${database.name}" deleted successfully.`);
          };

          deleteRequest.onerror = (event) => {
            console.error(
              `Error deleting database "${database.name}":`,
              event.target.error
            );
          };

          deleteRequest.onblocked = () => {
            console.warn(`Database "${database.name}" deletion is blocked.`);
          };
        });
      })
      .catch((error) => {
        console.error('Error retrieving databases:', error);
      });
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };
  const handleDeleteAccountClick = () => {
    setOpenDeleteDialog(true);
  };
  const handleDeleteConfirmation = () => {
    setOpenDeleteDialog(false);
    setOpenPasswordDialog(true);
  };

  const handlePasswordSubmit = async (password) => {
    try {
      const token = localStorage.getItem('accToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await deleteUserAccount(token, password);
      console.log(response);
      if (response.responseCode) {
        setOpenConfirmDeleteDialog(true);
      }

      // Account deleted successfully
    } catch (error) {
      console.error('Error deleting account:', error?.response?.data?.message);
      setSeverity('error');
      setShowError(true);
      setErrorMessage(
        error?.response?.data?.message || 'Failed to delete account'
      );
    }
  };

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  const handleClickShowNewPassword = () => setShowNewPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const confirm = () => {
    router.push('/');
    localStorage.removeItem('accToken');
    localStorage.clear();
  };

  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPasswords({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setDisableReset(true); // Reset to disabled state when dialog closes
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Prevent spaces from being entered
    if (value.includes(' ')) {
      return;
    }

    const newPasswords = { ...passwords, [name]: value };
    setPasswords(newPasswords);

    // Check if all fields are filled to enable/disable the button
    const allFieldsFilled =
      newPasswords.oldPassword &&
      newPasswords.newPassword &&
      newPasswords.confirmPassword;
    setDisableReset(!allFieldsFilled);

    if (name === 'newPassword') {
      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}"';<>?,./\\])(?!.*\s).{8,}$/;
      // Check for leading or trailing whitespace
      if (value !== value.trim()) {
        setErrors({
          ...errors,
          newPassword: 'Password cannot contain leading or trailing spaces.',
        });
      } else if (!passwordRegex.test(value)) {
        setErrors({
          ...errors,
          newPassword:
            'Password must contain at least 8 characters, one uppercase, one lowercase, one number, one special character, and no spaces',
        });
      } else {
        setErrors({ ...errors, newPassword: '' });
      }

      if (
        newPasswords.confirmPassword &&
        value !== newPasswords.confirmPassword
      ) {
        setErrors({
          ...errors,
          confirmPassword: 'Password and confirm password must be the same.',
        });
      } else if (
        newPasswords.confirmPassword &&
        value === newPasswords.confirmPassword
      ) {
        setErrors({ ...errors, confirmPassword: '' });
      }
    }

    if (name === 'confirmPassword') {
      if (value !== newPasswords.newPassword) {
        setErrors({
          ...errors,
          confirmPassword: 'Password and confirm password must be the same.',
        });
      } else {
        setErrors({ ...errors, confirmPassword: '' });
      }
    }
  };

  const handleSubmit = () => {
    let hasErrors = false;
    const newErrors = { ...errors };

    if (!passwords.oldPassword) {
      newErrors.oldPassword = 'Old password is required';
      hasErrors = true;
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
      hasErrors = true;
    } else {
      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}"';<>?,./\\])(?!.*\s).{8,}$/;
      // Check for leading or trailing whitespace
      if (passwords.newPassword !== passwords.newPassword.trim()) {
        newErrors.newPassword =
          'Password cannot contain leading or trailing spaces.';
        hasErrors = true;
      } else if (!passwordRegex.test(passwords.newPassword)) {
        newErrors.newPassword =
          'Password must contain at least 8 characters, one uppercase, one lowercase, one number, one special character, and no spaces';
        hasErrors = true;
      }
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      hasErrors = true;
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword =
        'Password and confirm password must be the same.';
      hasErrors = true;
    }

    setErrors(newErrors);

    if (!hasErrors) {
      resetPassword();
    }
  };

  const handleCloseSnackbar = () => {
    setShowError(false);
    setErrorMessage('');
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accToken') || '';
      console.log('Token:', token);
      const result = await resetUserPassword(
        passwords.oldPassword,
        passwords.newPassword,
        token
      );
      if (!result.success) {
        console.error('Reset password failed:', result.errorMessage);
        setDisableReset(true);
        setShowError(true);
        setErrorMessage(result.errorMessage);
        setSeverity('error');
      } else {
        setDisableReset(true);
        setShowSuccessDialog(true);
        handleClose();
      }
    } catch (error) {
      console.error('Reset password failed:', error);
      setShowError(true);
      setErrorMessage(error);
      setSeverity('error');
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const PasswordConfirmationDialog = ({ open, onClose, onSubmit }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassworddelete, setShowPassworddelete] = useState(false);

    const handleClickShowPassword = () =>
      setShowPassworddelete((prev) => !prev);

    const handleSubmit = () => {
      if (!password) {
        setError('Password is required');
        return;
      }
      onSubmit(password);
      onClose();
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your password to confirm account deletion.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type={showPassworddelete ? 'text' : 'password'}
            fullWidth
            variant="standard"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            InputLabelProps={{
              sx: {
                color: '#582E92',
                '&.Mui-focused': {
                  color: '#582E92',
                },
              },
            }}
            InputProps={{
              disableUnderline: false,
              sx: {
                '&:before': {
                  borderBottom: '1px solid #582E92',
                },
                '&:after': {
                  borderBottom: '2px solid #582E92',
                },
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: '#582E92' }}
                  >
                    {showPassworddelete ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: '#582E92' }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return (
      <Layout
        showTopAppBar={{
          title: 'Profile',
          showMenuIcon: true,
          profileIcon: [
            {
              icon: <LogoutIcon />,
              ariaLabel: 'Account',
              onLogoutClick: handleAccountClick,
            },
          ],
        }}
        isFooter={true}
      >
        <Box
          sx={{
            minHeight: '100vh',
            overflowY: 'auto',
            paddingTop: '3%',
            paddingBottom: '56px',
          }}
        >
          <Box sx={{ maxWidth: 600, margin: 'auto', mt: 3, p: 2 }}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: '12px',
                p: 3,
                mt: 3,
                transform: 'translateY(-5px)',
                boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'inherit',
                  padding: '1px',
                  background:
                    'linear-gradient(to right, #FF9911 50%, #582E92 50%)',
                  WebkitMask:
                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                },
              }}
            >
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="left"
                direction="row"
              >
                <Grid item>
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                    }}
                    src={profileData?.avatar ?? ''}
                  >
                    {(userData?.name?.charAt(0) ?? 'U').toUpperCase()}
                  </Avatar>
                </Grid>
                <Grid item>
                  <Typography
                    variant="h5"
                    textAlign="left"
                    color="#582E92"
                    fontWeight="bold"
                  >
                    {userData?.name}
                  </Typography>
                  <Typography variant="subtitle1" textAlign="left" color="gray">
                    {userData?.role}
                  </Typography>
                  {userData?.username && (
                    <Typography
                      variant="subtitle2"
                      component="div"
                      textAlign="left"
                      color="darkslategray"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 'bold',
                        fontSize: { xs: '12px', sm: '14px' },
                        flexWrap: 'wrap',
                        width: '100%',
                      }}
                    >
                      <Box component="span" sx={{ color: '#582E92' }}>
                        Username:
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: '150px', sm: 'none' },
                        }}
                      >
                        {userData.username}
                      </Box>
                    </Typography>
                  )}
                  {userData?.email && (
                    <Typography
                      variant="subtitle2"
                      component="div"
                      textAlign="left"
                      color="darkslategray"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 'bold',
                        fontSize: { xs: '12px', sm: '14px' },
                        flexWrap: 'wrap',
                        width: '100%',
                      }}
                    >
                      <Box component="span" sx={{ color: '#582E92' }}>
                        Email:
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: '150px', sm: 'none' },
                        }}
                      >
                        {userData.email}
                      </Box>
                    </Typography>
                  )}
                  {userData?.phone && (
                    <Typography
                      variant="subtitle2"
                      component="div"
                      textAlign="left"
                      color="darkslategray"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 'bold',
                        fontSize: { xs: '12px', sm: '14px' },
                        flexWrap: 'wrap',
                        width: '100%',
                      }}
                    >
                      <Box component="span" sx={{ color: '#582E92' }}>
                        Phone:
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: '150px', sm: 'none' },
                        }}
                      >
                        {userData.phone}
                      </Box>
                    </Typography>
                  )}

                  <Typography
                    component="span"
                    sx={{
                      color: '#582E92',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': {
                        color: '#461B73',
                      },
                      pointerEvents: 'auto',
                      userSelect: 'text',
                      position: 'relative',
                      zIndex: 1,
                    }}
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                  >
                    Reset Password
                  </Typography>
                </Grid>
              </Grid>
              <br></br>
              <br></br>
              <Grid
                container
                spacing={5}
                alignItems="center"
                justifyContent="center"
                direction="row"
              >
                <Grid item xs={12}>
                  {mappedProfile
                    .filter((item) => item.value)
                    .map((item) => {
                      const isExpandable =
                        (item.label === 'Professional Role' ||
                          item.label === 'Professional Subrole') &&
                        item.value.split(',').length > 4;

                      const isExpanded = expandedFields[item.label];
                      const displayedValue =
                        isExpandable && !isExpanded
                          ? item.value.split(',').slice(0, 1).join(',') + '...'
                          : item.value;

                      return (
                        <Box
                          key={item.label}
                          sx={{
                            display: 'flex',
                            flexDirection: {
                              xs: 'column',
                              sm: 'row',
                            },
                            justifyContent: 'space-between',
                            alignItems: {
                              xs: 'flex-start',
                              sm: 'flex-start',
                            },
                            paddingBottom: '10px',
                            marginTop: '8px',
                            width: '100%',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 'bold',
                              color: '#FF9911',
                              marginTop:
                                item.label === 'Professional Subrole'
                                  ? '0px'
                                  : 0,
                              minWidth: {
                                xs: '100%',
                                sm: '30%',
                              },
                              marginBottom: {
                                xs: '4px',
                                sm: 0,
                              },
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.label}:
                          </Typography>

                          <Box
                            sx={{
                              width: {
                                xs: '100%',
                                sm: '65%',
                              },
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px',
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 'bold',
                                color: '#333',
                                display: 'inline',
                              }}
                            >
                              {displayedValue}
                            </Typography>

                            {isExpandable && (
                              <Button
                                size="small"
                                onClick={() =>
                                  setExpandedFields((prev) => ({
                                    ...prev,
                                    [item.label]: !prev[item.label],
                                  }))
                                }
                                sx={{
                                  textTransform: 'none',
                                  mt: 0.5,
                                  display: 'inline-flex',
                                  color: '#582E92',
                                }}
                              >
                                {isExpanded ? 'Show Less' : 'Show More'}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                </Grid>
              </Grid>
            </Box>

            {/* Courses Card */}
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: 3,
                borderRadius: '12px',
                p: 3,
                mt: 3,
                transform: 'translateY(-5px)',
                boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'inherit',
                  padding: '1px',
                  background:
                    'linear-gradient(to right, #FF9911 50%, #582E92 50%)',
                  WebkitMask:
                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                },
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="black"
              >
                📘 My Courses
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {courseDetails?.data?.length > 0 ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Course ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>View</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseDetails?.data
                        ?.filter(
                          (course: any) => course.status === 'viewCertificate'
                        )
                        .map((course: any) => (
                          <TableRow
                            key={course.usercertificateId}
                            hover
                            sx={{
                              transition: '0.3s',
                              '&:hover': { backgroundColor: '#f9f9f9' },
                            }}
                          >
                            <TableCell>{course.courseId}</TableCell>
                            <TableCell>{course.status}</TableCell>
                            <TableCell>
                              <Link
                                component="button"
                                variant="body2"
                                underline="hover"
                                onClick={() =>
                                  handleViewTest(course.certificateId)
                                }
                              >
                                View Certificate
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No course data found.
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                onClick={handleDeleteAccountClick}
                variant="contained"
                sx={{
                  bgcolor: '#582E92',
                  color: 'white',
                  ':hover': { bgcolor: '#461B73' },
                }}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              sx={{ color: '#582E92' }}
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirmation} color="error">
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>

        {/* Password Confirmation Dialog */}
        <PasswordConfirmationDialog
          open={openPasswordDialog}
          onClose={() => setOpenPasswordDialog(false)}
          onSubmit={handlePasswordSubmit}
        />

        {/* Success Dialog */}
        <Dialog
          open={openConfirmDeleteDialog}
          onClose={() => setOpenConfirmDeleteDialog(false)}
        >
          <DialogTitle>
            Your account has been successfully deleted!!
          </DialogTitle>
          <DialogContent></DialogContent>
          <DialogActions>
            <Button onClick={confirm} sx={{ color: '#582E92' }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showLogoutModal} onClose={handleLogoutCancel}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to log out?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogoutCancel} sx={{ color: '#582E92' }}>
              No
            </Button>
            <Button onClick={handleLogoutConfirm} color="error">
              Yes, Logout
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={open} onClose={handleClose}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 'auto',
            }}
          >
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              sx={{
                maxWidth: { xs: '90%', sm: '400px', md: '500px' },
                bgcolor: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                borderRadius: '16px',
                padding: { xs: 2, sm: 3 },
                textAlign: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '10px',
                  padding: '4px',
                  background:
                    'linear-gradient(to right, #FF9911 50%, #582E92 50%)',
                  WebkitMask:
                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                },
              }}
            >
              <DialogTitle sx={{ width: '100%', p: 0, mb: 2 }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: 600 }}
                >
                  Reset Password
                </Typography>
              </DialogTitle>

              <DialogContent sx={{ width: '100%', p: 0 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  name="oldPassword"
                  label="Old Password"
                  type={showOldPassword ? 'text' : 'password'}
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  error={!!errors.oldPassword}
                  helperText={errors.oldPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          edge="end"
                        >
                          {showOldPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </DialogContent>

              <DialogActions sx={{ width: '100%', p: 0, mt: 2 }}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  sx={{
                    mr: 2,
                    color: '#582E92',
                    borderRadius: '30px',
                    borderColor: '#582E92',
                    '&:hover': {
                      borderColor: '#461B73',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={disableReset}
                  variant="contained"
                  sx={{
                    bgcolor: '#582E92',
                    color: '#FFFFFF',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '8px 16px',
                    '&:hover': {
                      bgcolor: '#543E98',
                    },
                    width: { xs: '50%', sm: '50%' },
                  }}
                >
                  Reset Password
                </Button>
              </DialogActions>
            </Grid>
          </Box>
        </Dialog>

        <Dialog open={showSuccessDialog} onClose={() => {}}>
          <DialogTitle>Password Reset</DialogTitle>
          <DialogContent>
            Your password has been reset successfully.
          </DialogContent>
          <DialogActions>
            <Button
              color="#6750A4"
              onClick={() => {
                setShowSuccessDialog(false);
                localStorage.clear();
                router.push('/');
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showError}
          autoHideDuration={severity === 'success' ? 1000 : 6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={severity}
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Layout>
    );
  } else {
    handleLogoutConfirm();
  }
}
