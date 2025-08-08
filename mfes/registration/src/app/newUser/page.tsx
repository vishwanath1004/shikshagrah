/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Box,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  fetchLocationData,
  generateOTP,
  verifyOtpService,
  registerUserService,
} from '../service'; // Import OTP verify service
import { useRouter } from 'next/navigation';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
const NewUserWithStepper: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    yearOfBirth: '',
    contact: '',
    password: '',
    contactType: 'email',
  });
  const [error, setError] = useState({
    username: false,
    yearOfBirth: false,
    contact: false,
    password: false,
    otp: false,
    confirmPassword: false,
  });
  const [birthYearOptions, setBirthYearOptions] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSubRole, setSelectedSubRole] = useState<string[]>([]);
  const [udisecode, setUdisecode] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [locationData, setLocationData] = useState<any>({});
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValid, setOtpValid] = useState(false);
  const [invalidOtp, setInvalidOtp] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(2);
  const router = useRouter();
  const [resendCount, setResendCount] = useState(0); // Track resend attempts
  const [enableResend, setEnableResend] = useState(false);

  const [userData, setUserData] = useState<any>({});
  const [timer, setTimer] = useState(60);
  const [requestData, setRequestData] = useState<any>({});
  const steps = [
    'Personal Details',
    'Location Details',
    'Email/Password',
    'OTP',
  ];
  const [contactType, setContactType] = useState('email');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [formValid, setFormValid] = useState(null);
  const [resendClick, setResendClick] = useState(false);

  // Email/Password regex
  const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10}$/;
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}:":;'<>?,./\\]).{8,}$/;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = React.useState('');
  const subRoles = [
    { label: 'HM', value: 'hm' },
    { label: 'CRP', value: 'crp' },
    { label: 'Complex HM', value: 'chm' },
    { label: 'MEO', value: 'meo' },
    { label: 'DyEO', value: 'dyeo' },
    { label: 'ATWO', value: 'atwo' },
    { label: 'DTWO', value: 'dtwo' },
    { label: 'GCDO PMRC', value: 'gcdo_pmrc' },
    { label: 'CMO PMRC', value: 'cmo_pmrc' },
    { label: 'AMO PMRC', value: 'amo_pmrc' },
    { label: 'DDTW', value: 'ddtw' },
    { label: 'ASO DPO', value: 'aso_dpo' },
    { label: 'Asst ALS Coordinator', value: 'asst_als_coordinator' },
    { label: 'Asst IE Coordinator', value: 'asst_ie_coordinator' },
    { label: 'ALS Coordinator', value: 'als_coordinator' },
    { label: 'IE Coordinator', value: 'ie_coordinator' },
    { label: 'CMO', value: 'cmo' },
    { label: 'AAMO', value: 'aamo' },
    { label: 'AMO', value: 'amo' },
    { label: 'APC', value: 'apc' },
    { label: 'DIET Lecturer', value: 'diet_lecturer' },
    { label: 'DIET Principal', value: 'diet_principal' },
    { label: 'DEO', value: 'deo' },
    { label: 'RJD', value: 'rjd' },
    { label: 'SLCC', value: 'slcc' },
    { label: 'SLMO', value: 'slmo' },
    { label: 'Director Adult Education', value: 'dir_ad_ed' },
    { label: 'Director Public Libraries', value: 'dir_pub_lib' },
    { label: 'Director SCERT', value: 'dir_scert' },
    { label: 'Secretary KGBV', value: 'sec_kgbv' },
    { label: 'Secretary Public Libraries', value: 'sec_pub_lib' },
    { label: 'Deputy Director Adult Education', value: 'dep_dir_ad_ed' },
    {
      label: 'Librarian Public Libraries/ Book Deposit Center',
      value: 'lib_bdc',
    },
    { label: 'Instructor/ Volunteer Adult Education', value: 'ins_ad_ed' },
    { label: 'BDC Incharge', value: 'bdc_inch' },
    { label: 'SPD', value: 'spd' },
    { label: 'Librarian Public Libraries', value: 'lib_pub_lib' },
    { label: 'Supervisor Adult Education', value: 'sup_ad_ed' },
  ];
  // Generate Year Options
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 1920 + 1 },
      (_, i) => currentYear - i
    );
    setBirthYearOptions(years);
  }, []);

  const handleChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const value = String(event.target.value);

      // Handle validation for "username" field
      if (field === 'username') {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError((prev) => ({
          ...prev,
          [field]: !/^[a-zA-Z ]*$/.test(value), // Allows only letters and spaces
        }));
      } else {
        // Generic validation for other fields
        setFormData((prev) => ({ ...prev, [field]: value.trim() }));
        setError((prev) => ({ ...prev, [field]: value.trim() === '' }));
      }
    };

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRole(event.target.value as string);
    if (event.target.value !== 'administrator') setSelectedSubRole([]);
  };

  const handleSubRoleChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const { value } = event.target;
    setSelectedSubRole(
      typeof value === 'string' ? value.split(',') : (value as string[])
    );
  };

  const handleUdiseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/\s/g, ''); // Remove spaces
    setUdisecode(newValue);
    setLocationData({}); // Clear previously fetched location data
    setButtonDisabled(true); // Disable Send OTP button until fetch
    setShowError(false);
  };

  // Step 1 Validation
  const handleStep1Continue = () => {
    const isFormValid =
      formData.username.trim() &&
      birthYearOptions.includes(Number(formData.yearOfBirth));
    if (isFormValid) {
      setActiveStep(1);
    } else {
      setError({
        username: formData.username.trim() === '',
        yearOfBirth: !birthYearOptions.includes(Number(formData.yearOfBirth)),
      });
    }
  };

  // Step 2: Fetch Location Data
  const handleFetchLocation = async () => {
    if (!udisecode) {
      setShowError(true);
      setErrorMessage('Please enter a valid UDISE Code');
      setButtonDisabled(true);
      return;
    }

    try {
      setButtonDisabled(true); // Keep disabled until fetch is successful
      const newLocationData = await fetchLocationData(udisecode);

      if (newLocationData?.state) {
        setLocationData(newLocationData);
        setShowError(false);
        setButtonDisabled(false); // Enable Send OTP button only after successful fetch
      } else {
        setShowError(true);
        setErrorMessage('Invalid UDISE Code');
        setButtonDisabled(true);
      }
    } catch (error: any) {
      setShowError(true);
      setErrorMessage(error.message);
      setButtonDisabled(true);
    }
  };

  const handleValidation = () => {
    const contactValid =
      contactType === 'email'
        ? emailRegex.test(contact)
        : phoneRegex.test(contact);
    const passwordValid = passwordRegex.test(password);
    setError({ contact: !contactValid, password: !passwordValid });
    setFormValid(contactValid && passwordValid);
  };

  const handleStep3Continue = async () => {
    // e.preventDefault();
    handleValidation();
    if (contact && !error.contact) {
      try {
        formData.contact = contact;
        formData.password = password;
        // const response = await generateOTP(formData.contact, contactType);
        const response = await registerUserService(
          formData.contact,
          contactType
        );

        // if (response.success == false) {
        //   setError(response.message);
        //   setShowError(true);
        //   setErrorMessage(response.message);
        // } else {
        //   setOtpSent(true);
        //   setActiveStep(3);

        //   // Prepare request data
        //   const name = formData.username || '';
        //   const nameParts = name.split(' ');
        //   const firstName = nameParts[0] || '';
        //   const lastName = nameParts.slice(1).join(' ') || '';

        //   const firstNameLower = firstName.toLowerCase();
        //   const lastNameLower = lastName
        //     .split(' ')
        //     .map(
        //       (part) =>
        //         part.charAt(0).toLowerCase() + part.slice(1).toLowerCase()
        //     )
        //     .join('');

        //   const userName = `${firstNameLower}_${lastNameLower}`;
        //   const dob = formData.yearOfBirth; // Assuming this is in YYYY format

        //   const profileLocation = [
        //     locationData.state[0],
        //     locationData.district[0],
        //     locationData.block[0],
        //     locationData.cluster[0],
        //     locationData.school[0],
        //   ].filter(Boolean);

        //   const userTypes = [];
        //   const userRole = selectedRole || '';

        //   if (userRole === 'administrator') {
        //     selectedSubRole.forEach((role) => {
        //       userTypes.push({
        //         type: userRole,
        //         subType: role.toLowerCase(),
        //       });
        //     });
        //   } else if (userRole === 'youth' || userRole === 'teacher') {
        //     userTypes.push({
        //       type: userRole,
        //       subType: '',
        //     });
        //   }

        //   if (contactType === 'email') {
        //     setRequestData({
        //       usercreate: {
        //         request: {
        //           firstName,
        //           lastName,
        //           organisationId: process.env.NEXT_PUBLIC_ORGID, // Update to match your env variable
        //           email: contact,
        //           emailVerified: true,
        //           userName,
        //           password: formData.password,
        //           dob,
        //           roles: ['PUBLIC'],
        //         },
        //       },
        //       profileLocation,
        //       profileUserTypes: userTypes,
        //     });
        //   } else {
        //     setRequestData({
        //       usercreate: {
        //         request: {
        //           firstName,
        //           lastName,
        //           organisationId: process.env.NEXT_PUBLIC_ORGID, // Update to match your env variable
        //           phone: contact,
        //           phoneVerified: true,
        //           userName,
        //           password: formData.password,
        //           dob,
        //           roles: ['PUBLIC'],
        //         },
        //       },
        //       profileLocation,
        //       profileUserTypes: userTypes,
        //     });
        //   }

        //   setUserData({
        //     ...formData,
        //     locationData,
        //   });
        //   localStorage.setItem('contact', contact);
        // }
      } catch (error) {
        console.error('Error generating OTP:', error);
      }
    }
  };

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value);
    setShowError(false);
    setError((prev) => ({ ...prev, otp: event.target.value === '' }));
  };

  const handleSubmit = async () => {
    console.log('OTP submitted');
    // if (remainingAttempts <= 0) {
    //   setShowError(true);
    //   setErrorMessage(
    //     'You have exceeded the maximum OTP attempts. Please request a new OTP.'
    //   );
    //   return;
    // }

    setShowError(false);
    // if (otp.length < 5 || otp.length > 6) {
    //   setInvalidOtp(true);
    //   setRemainingAttempts((prev) => Math.max(0, prev - 1)); // Prevent negative values
    //   return;
    // }

    try {
      const email = contact;
      // const otpResponse = await verifyOtpService(email, otp, contactType);
      // const err = otpResponse?.response;

      // if (
      //   otpResponse ===
      //     'OTP verification failed. Remaining attempt count is 0.' ||
      //   otpResponse ===
      //     'OTP verification failed. Remaining attempt count is 1.' ||
      //   err?.data?.params?.status === 'FAILED'
      // ) {
      //   setShowError(true);
      //   setErrorMessage(err.data.params.errmsg);
      //   setInvalidOtp(true);
      //   setRemainingAttempts((prev) => Math.max(0, prev - 1)); // Prevent negative values
      //   return;
      // } else if (otpResponse.params.status === 'SUCCESS') {
      // console.log('OTP verified successfully', requestData);
      // formData.contact = contact;
      // formData.password = password;
      const contactValid =
        contactType === 'email'
          ? emailRegex.test(contact)
          : phoneRegex.test(contact);
      const registrationResponse = await registerUserService(
        formData.contact,
        contactType
      );

      if (registrationResponse.success === true) {
        setErrorMessage(registrationResponse.message);
        setDialogOpen(true);
      } else {
        setShowError(true);
        setErrorMessage(
          registrationResponse.data
            ? registrationResponse.data.error.params.errmsg
            : registrationResponse.error.params.errmsg
        );
      }
      // }
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message || 'An error occurred');
    }
  };

  const handleResendOtp = () => {
    if (resendCount >= 4) {
      setShowError(true);
      setErrorMessage(
        'You have reached the maximum OTP resends. Please try again after 1 hour.'
      );
      return;
    }

    setResendCount((prev) => prev + 1); // Increment instead of decrement
    setEnableResend(false);
    setTimer(60);
    setResendClick(true);
    setRemainingAttempts(3); // Reset attempts after resending OTP

    console.log('OTP resent');
    // handleStep3Continue();

    if (resendCount + 1 >= 4) {
      setTimeout(() => {
        setResendCount(0);
        setEnableResend(true);
      }, 3600000); // 1 hour timeout
    }
  };

  const handleBack = () => {
    setShowError(false);
    setErrorMessage('');
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setEnableResend(true);
    }
  }, [timer]);
  const handleChangecontact = (field) => (event) => {
    const value = event.target.value;

    if (field === 'contact') {
      setContact(value);
      setError((prev) => ({
        ...prev,
        contact:
          contactType === 'email'
            ? !emailRegex.test(value) // Validate email format
            : !phoneRegex.test(value), // Validate phone format
      }));
    }

    if (field === 'password') {
      setPassword(value);
      setError((prev) => ({
        ...prev,
        password: !passwordRegex.test(value), // Validate password format
        confirmPassword: confirmPassword && confirmPassword !== value, // Validate confirmPassword against the new password
      }));
    }

    if (field === 'confirmPassword') {
      setConfirmPassword(value);
      setError((prev) => ({
        ...prev,
        confirmPassword: value !== password, // Validate confirmPassword matches password
      }));
    }

    setFormValid(null); // Reset form validation status
    setShowError(false); // Clear error message display
  };
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setDialogOpen(false);
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
    localStorage.clear();
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
          // Allow scrolling if content is large
          paddingBottom: '60px',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '2px solid #FFD580', // Light shade of #FF9911 for the bottom border
            boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)', // Subtle shadow
            backgroundColor: '#FFF7E6', // Light background derived from #FF9911
            borderRadius: '0 0 25px 25px', // Rounded corners only on the bottom left and right
          }}
        >
          <Grid container alignItems="center">
            {/* Conditionally render the back button */}
            {activeStep > 0 && (
              <Grid item xs={2}>
                <Button
                  onClick={handleBack}
                  sx={{
                    color: '#572E91',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                    },
                  }}
                >
                  <ArrowBackIcon sx={{ marginRight: '4px' }} />
                  Back
                </Button>
              </Grid>
            )}

            <Grid
              item
              xs={activeStep > 0 ? 8 : 12}
              textAlign="center"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#572E91',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                }}
              >
                Step {activeStep + 1}/4
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Step Content */}
        <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
          {/* Step 1: Personal Details */}
          {activeStep === 0 && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mb: 3,
                  bgcolor: '#f5f5f5',
                }}
              >
                <Box
                  component="img"
                  src="assets/images/SG_Logo.jpg"
                  alt="logo"
                  sx={{
                    width: '50%',
                    height: '50%',
                    bgcolor: '#f5f5f5',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#572E91',
                  fontWeight: 'bold',
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                Welcome to Shikshagraha
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#333', mb: 3, textAlign: 'center' }}
              >
                Register
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  label="Name"
                  value={formData.username}
                  onChange={handleChange('username')}
                  error={error.username}
                  helperText={
                    error.username
                      ? 'Name should contain only letters and spaces.'
                      : ''
                  }
                  inputProps={{
                    pattern: '[a-zA-Z ]*', // Allows only letters and spaces
                  }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Year of Birth</InputLabel>
                <Select
                  label="Year of Birth"
                  value={formData.yearOfBirth}
                  onChange={handleChange('yearOfBirth')}
                  error={error.yearOfBirth}
                >
                  <MenuItem value="" disabled>
                    Select Year
                  </MenuItem>
                  {birthYearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Button
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

                    width: '50%', // Ensures it spans the width of its container
                  }}
                  variant="contained"
                  onClick={handleStep1Continue}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Location Details */}
          {activeStep === 1 && (
            <Box
              sx={{
                height: '70vh',
                overflowY: 'auto',
                padding: 2,
              }}
            >
              <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                <InputLabel>Select Role</InputLabel>
                <Select
                  label="Select Role"
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="administrator">HT & Officials</MenuItem>
                  <MenuItem value="youth">Youth</MenuItem>
                </Select>
              </FormControl>

              {selectedRole === 'administrator' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Sub Role</InputLabel>
                  <Select
                    label="Select Sub Role"
                    multiple
                    value={selectedSubRole}
                    onChange={handleSubRoleChange}
                    renderValue={(selected) =>
                      selected
                        .map((value) => {
                          const selectedRole = subRoles.find(
                            (role) => role.value === value
                          );
                          return selectedRole ? selectedRole.label : value;
                        })
                        .join(', ')
                    }
                  >
                    {subRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Checkbox
                          checked={selectedSubRole.includes(role.value)}
                        />
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="UDISE Code"
                value={udisecode}
                onChange={handleUdiseChange}
                fullWidth
                sx={{ mb: 2 }}
                disabled={
                  !selectedRole ||
                  (selectedRole === 'administrator' &&
                    selectedSubRole.length === 0) // Disable for admin until sub-role is selected
                }
              />

              {/* Fetch Location Button */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleFetchLocation}
                  sx={{
                    bgcolor: '#582E92',
                    color: '#FFFFFF',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '8px 16px',
                    '&:hover': { bgcolor: '#543E98' },
                    width: { xs: '50%', sm: '50%' }, // Responsive width
                  }}
                  disabled={
                    !udisecode ||
                    (selectedRole === 'administrator' &&
                      selectedSubRole.length === 0)
                  }
                >
                  Fetch Location
                </Button>
              </Box>

              {showError && <Alert severity="error">{errorMessage}</Alert>}

              {/* Responsive Location Details Card */}
              {locationData.state && (
                <Box sx={{ marginTop: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: 3,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Grid container spacing={2}>
                      {[
                        { label: 'State', value: locationData.state[0]?.name },
                        {
                          label: 'District',
                          value: locationData.district[0]?.name,
                        },
                        { label: 'Block', value: locationData.block[0]?.name },
                        {
                          label: 'Cluster',
                          value: locationData.cluster[0]?.name,
                        },
                        {
                          label: 'School',
                          value: locationData.school[0]?.name,
                        },
                      ].map((item, index) => (
                        <Grid item xs={12} key={index}>
                          {' '}
                          {/* Each item takes full width */}
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 'bold', color: '#333' }}
                          >
                            <span style={{ color: '#FF9911' }}>
                              {item.label}:{' '}
                            </span>
                            {item.value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}

              {/* Continue Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(2)}
                  sx={{
                    bgcolor: '#582E92',
                    color: '#FFFFFF',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '8px 16px',
                    '&:hover': { bgcolor: '#543E98' },
                    width: { xs: '50%', sm: '50%' }, // Responsive width
                  }}
                  disabled={
                    !locationData?.state ||
                    !udisecode ||
                    (selectedRole === 'administrator' &&
                      selectedSubRole.length === 0)
                  }
                >
                  Continue
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 3: Email/Password */}
          {activeStep === 2 && (
            <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
              <Typography
                variant="h5"
                align="center"
                sx={{ color: '#572E91', fontWeight: 'bold', fontSize: '1rem' }}
              >
                Enter your Email or Mobile Number{' '}
                <Typography component="span" sx={{ color: 'red' }}>
                  *
                </Typography>
              </Typography>
              <RadioGroup
                sx={{ color: 'black', fontWeight: 'bold', fontSize: '10px' }}
                row
                value={contactType}
                onChange={(e) => {
                  setContactType(e.target.value);
                  setContact(''); // Clear contact input when switching between email and phone
                  setError((prev) => ({ ...prev, contact: false })); // Reset validation error
                }}
              >
                <FormControlLabel
                  value="email"
                  control={<Radio />}
                  label="Email"
                />
                <FormControlLabel
                  value="phone"
                  control={<Radio />}
                  label="Mobile Number"
                />
              </RadioGroup>
              <TextField
                label={
                  <>
                    {contactType === 'email' ? 'Email ID' : 'Mobile Number'}{' '}
                    <Typography component="span" sx={{ color: 'red' }}>
                      *
                    </Typography>
                  </>
                }
                variant="outlined"
                fullWidth
                value={contact}
                onChange={handleChangecontact('contact')}
                helperText={
                  error.contact
                    ? `Invalid ${contactType}. Please enter a valid ${contactType}.`
                    : ''
                }
                error={error.contact}
                sx={{ mb: 3 }}
                inputProps={
                  contactType === 'phone'
                    ? {
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        maxLength: 10,
                      }
                    : {}
                }
              />

              <TextField
                fullWidth
                label={
                  <>
                    Password{' '}
                    <Typography component="span" sx={{ color: 'red' }}>
                      *
                    </Typography>
                  </>
                }
                value={password}
                onChange={handleChangecontact('password')}
                type={showPassword ? 'text' : 'password'}
                error={error.password}
                helperText={
                  error.password
                    ? 'Password must be at least 8 characters long, include numerals, uppercase, lowercase, and special characters.'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </IconButton>
                  ),
                }}
                sx={{
                  mb: 3,
                }}
              />

              <TextField
                fullWidth
                label={
                  <>
                    Confirm Password{' '}
                    <Typography component="span" sx={{ color: 'red' }}>
                      *
                    </Typography>
                  </>
                }
                value={confirmPassword}
                onChange={handleChangecontact('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                error={error.confirmPassword}
                helperText={
                  error.confirmPassword
                    ? 'Password and confirm password must be the same.'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </IconButton>
                  ),
                }}
                sx={{
                  mb: 2,
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Button
                  // onClick={handleStep3Continue}
                  onClick={handleSubmit}
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
                    width: '50%',
                  }}
                  disabled={
                    !contact ||
                    !password ||
                    !confirmPassword ||
                    error.contact ||
                    error.password ||
                    error.confirmPassword
                  }
                >
                  Submit
                </Button>
                {showError && <Alert severity="error">{errorMessage}</Alert>}
              </Box>
            </Box>
          )}

          {/* Step 4: OTP Verification */}
          {activeStep === 3 && (
            <Box
              sx={{
                height: '75vh',
                overflowY: 'scroll',
                padding: '20px',

                borderRadius: '12px',
              }}
            >
              {/* User Details */}
              <Box
                sx={{
                  margin: '20px 0',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: 3,
                  padding: '20px',
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: '#572E91',
                    marginBottom: '20px',
                  }}
                >
                  User Details
                </Typography>
                <Grid container spacing={3}>
                  {/* Name */}
                  <Grid item xs={12}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FF9911' }}>Name: </span>
                      {userData?.username || 'N/A'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FF9911' }}>Year of Birth: </span>
                      {userData?.yearOfBirth || 'N/A'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FF9911' }}>State: </span>
                      {userData?.locationData?.state?.name || 'N/A'}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FF9911' }}>District: </span>
                      {userData?.locationData?.district?.name || 'N/A'}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FF9911' }}>Block: </span>
                      {userData?.locationData?.block?.name || 'N/A'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FF9911' }}>Cluster: </span>
                      {userData?.locationData?.cluster?.name || 'N/A'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FF9911' }}>School: </span>
                      {userData?.locationData?.school?.name || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* OTP Section */}
              <Typography
                sx={{
                  color: 'black',
                  marginBottom: '15px',
                  fontSize: '15px',
                  textAlign: 'center',
                }}
              >
                OTP has been sent to:{' '}
                <strong>{userData?.contact || 'N/A'}</strong>
                <Typography sx={{ fontSize: '13px', color: '#999' }}>
                  It is valid for 30 minutes.
                </Typography>
              </Typography>

              {invalidOtp && (
                <Typography
                  sx={{
                    color: 'red',
                    marginBottom: '10px',
                    textAlign: 'center',
                    fontSize: '14px',
                  }}
                >
                  Invalid OTP. Remaining attempts: {remainingAttempts}
                </Typography>
              )}

              <TextField
                label="Enter OTP"
                variant="outlined"
                fullWidth
                value={otp}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, '');
                  setOtp(value);
                  setShowError(false);
                  setError((prev) => ({ ...prev, otp: value === '' }));
                }}
                sx={{
                  marginBottom: '20px',
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                    {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                type="text" // Keep it "text" to prevent the spinner
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Button
                  onClick={handleSubmit}
                  sx={{
                    bgcolor:
                      otp.length >= 5 && remainingAttempts > 0
                        ? '#572e91'
                        : '#ddd',
                    color:
                      otp.length >= 5 && remainingAttempts > 0
                        ? '#FFFFFF'
                        : '#999',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '8px 16px',
                    '&:hover': { bgcolor: '#543E98' },
                    width: '50%',
                  }}
                  disabled={otp.length < 5 || remainingAttempts <= 0}
                >
                  Verify OTP
                </Button>
              </Box>

              {showError && (
                <Alert severity="error" sx={{ marginTop: '15px' }}>
                  {errorMessage}
                </Alert>
              )}

              <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
                <Typography>
                  Didn’t receive the OTP?{' '}
                  <Button
                    onClick={handleResendOtp}
                    disabled={!enableResend || resendCount >= 2}
                    sx={{
                      textTransform: 'none',
                      color: '#572E91',
                      fontWeight: 'bold',
                    }}
                  >
                    Resend OTP
                  </Button>
                </Typography>
                {!enableResend && (
                  <Typography sx={{ color: '#999', marginTop: '5px' }}>
                    {timer} seconds remaining.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
        {/* <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #FF9911',
        py: 2,
        textAlign: 'center',
        zIndex: 1000, // Ensure the footer stays on top
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        Have an Account?{' '}
        <Button
          sx={{
            textTransform: 'uppercase',
            color: '#582E92',
            fontWeight: 'bold',
          }}
          onClick={() => router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`)}
        >
          Sign In
        </Button>
      </Typography>
    </Box> */}
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Registration Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Welcome, {requestData?.usercreate?.request?.userName} Your account
            has been successfully registered. Please use your username to login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewUserWithStepper;
