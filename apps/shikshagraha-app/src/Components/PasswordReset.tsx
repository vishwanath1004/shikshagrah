// components/ForgotPassword.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  sendOtp,
  verifyOtpService,
  resetPassword,
  sendForgetOtp,
} from '../services/LoginService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Visibility, VisibilityOff } from '@mui/icons-material';
const PasswordReset = ({ name }: { name: string }) => {
  const router = useRouter();
  const [step, setStep] = useState<'reset' | 'otp' | 'input'>('reset');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [formErrors, setFormErrors] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
  });
  const usernameRegex =
    /^(?:[a-z0-9_-]{3,40}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}"';<>?,./\\])(?!.*\s).{8,}$/;
  const [timer, setTimer] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(605);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  // Calculate remaining time
  const remainingResendTime = lastResendTime
    ? Math.max(0, 30 - Math.floor((Date.now() - lastResendTime) / 1000))
    : 0;

  // Rate limiting state
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  const validateIdentifierFormat = (identifier: string): boolean => {
    if (!identifier) return false;

    const isMobile = mobileRegex.test(identifier);
    const isEmail = emailRegex.test(identifier);
    const isUsername = usernameRegex.test(identifier);

    return isMobile || isEmail || isUsername;
  };

  const handleRateLimit = (retrySeconds: number = 120) => {
    console.log('Rate limiting triggered with retry seconds:', retrySeconds);
    const now = Date.now();
    setIsRateLimited(true);
    setRateLimitTimer(retrySeconds);
    setRateLimitMessage(
      "You've reached the request limit. Please try again later."
    );

    // Start countdown timer
    const interval = setInterval(() => {
      setRateLimitTimer((prev) => {
        const remaining = prev - 1;
        if (remaining <= 0) {
          clearInterval(interval);
          setIsRateLimited(false);
          setRateLimitMessage('');
          console.log('Rate limiting expired');
          return 0;
        }
        // Update message with current countdown
        setRateLimitMessage(
          `You've reached the request limit. Please try again in ${formatRateLimitTime(
            remaining
          )}.`
        );
        return remaining;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // When typing into identifier field
    if (name === 'identifier') {
      let newValue = value;

      // Check if input starts with 0-5 (invalid mobile prefix)
      if (/^[0-5]/.test(newValue)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Mobile number must start with 6, 7, 8, or 9',
        }));
        // Don't update the value if it starts with invalid digits
        return;
      }

      // If input starts with 6-9, treat as mobile
      const isPotentialMobile = /^[6-9]/.test(newValue);

      if (isPotentialMobile) {
        // Remove non-digit characters
        newValue = newValue.replace(/\D/g, '');

        // Limit to 10 digits
        if (newValue.length > 10) {
          newValue = newValue.slice(0, 10);
        }

        // Validate mobile number format
        if (newValue.length > 0 && newValue.length < 10) {
          setFormErrors((prev) => ({
            ...prev,
            [name]: 'Mobile number must be exactly 10 digits',
          }));
        } else if (newValue.length === 10 && !mobileRegex.test(newValue)) {
          setFormErrors((prev) => ({
            ...prev,
            [name]:
              'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9',
          }));
        } else if (newValue.length === 10 && mobileRegex.test(newValue)) {
          setFormErrors((prev) => ({
            ...prev,
            [name]: '',
          }));
        } else {
          setFormErrors((prev) => ({
            ...prev,
            [name]: '',
          }));
        }
      } else if (newValue.includes('@')) {
        // Email validation
        setFormErrors((prev) => ({
          ...prev,
          [name]: emailRegex.test(newValue)
            ? ''
            : 'Please enter a valid email address',
        }));
      } else if (newValue.length > 0) {
        // Username validation (if not mobile or email)
        setFormErrors((prev) => ({
          ...prev,
          [name]: usernameRegex.test(newValue)
            ? ''
            : 'Please enter a valid username. It can be either a valid email address or a custom username (3-40 characters, lowercase letters and numbers only, with hyphens and underscores allowed)',
        }));
      } else {
        // Reset identifier error if empty
        setFormErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }

      // Update identifier state
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      return;
    }

    // For other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOtp = async () => {
    if (!formData?.identifier || !formData?.password) {
      setError('Please provide both identifier and password');
      setShowError(true);
      return;
    }

    // Validate identifier format before making API call
    const isMobile = mobileRegex.test(formData.identifier);
    const isEmail = emailRegex.test(formData.identifier);
    const isUsername = usernameRegex.test(formData.identifier);

    if (!isMobile && !isEmail && !isUsername) {
      setError(
        'The identifier format is invalid. Please enter a valid email or phone number.'
      );
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const otpPayload = {
        identifier: formData.identifier,
        password: formData.password,
        ...(isMobile && { phone_code: '+91' }),
      };

      console.log(otpPayload);
      const response = await sendForgetOtp(otpPayload);

      console.log(response);
      if (response?.responseCode === 'OK') {
        setStep('otp');
        setSecondsLeft(605);
      } else {
        // Handle specific error cases
        const errorMessage =
          response?.message ||
          response?.params?.errmsg ||
          response?.params?.err;

        console.log('Received error message:', errorMessage);

        if (
          errorMessage?.toLowerCase().includes('invalid') ||
          errorMessage?.toLowerCase().includes('not found') ||
          errorMessage?.toLowerCase().includes('does not exist')
        ) {
          setError('Invalid Login ID.');
        } else if (
          errorMessage?.toLowerCase().includes('format') ||
          errorMessage?.toLowerCase().includes('invalid identifier')
        ) {
          setError(
            'The identifier format is invalid. Please enter a valid email, mobile number, or username (3-40 characters, lowercase letters, numbers, hyphens, underscores).'
          );
        } else if (
          errorMessage === 'Too many requests. Please try again later.' ||
          errorMessage?.toLowerCase().includes('too many requests') ||
          errorMessage?.toLowerCase().includes('rate limit') ||
          errorMessage?.toLowerCase().includes('request limit') ||
          errorMessage?.toLowerCase().includes('please try again later') ||
          errorMessage?.toLowerCase().includes('too many attempts') ||
          errorMessage?.toLowerCase().includes('rate exceeded') ||
          errorMessage?.toLowerCase().includes('throttled')
        ) {
          // Extract retry time from error message if available, default to 120 seconds
          const retryMatch = errorMessage.match(/(\d+)/);
          const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 120;
          handleRateLimit(retrySeconds);
          setError(
            `You've reached the request limit. Please try again in ${formatRateLimitTime(
              retrySeconds
            )}.`
          );
        } else {
          setError(errorMessage || 'Failed to send OTP. Please try again.');
        }
        setShowError(true);
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);

      // Handle axios error responses
      if (err?.response?.data) {
        const errorData = err.response.data;
        const errorMessage =
          errorData?.message ||
          errorData?.params?.errmsg ||
          errorData?.params?.err;

        console.log('Received error message:', errorMessage);

        if (
          errorMessage?.toLowerCase().includes('invalid') ||
          errorMessage?.toLowerCase().includes('not found') ||
          errorMessage?.toLowerCase().includes('does not exist')
        ) {
          setError('Invalid Login ID.');
        } else if (
          errorMessage?.toLowerCase().includes('format') ||
          errorMessage?.toLowerCase().includes('invalid identifier')
        ) {
          setError(
            'The identifier format is invalid. Please enter a valid email, mobile number, or username (3-40 characters, lowercase letters, numbers, hyphens, underscores).'
          );
        } else if (
          errorMessage === 'Too many requests. Please try again later.' ||
          errorMessage?.toLowerCase().includes('too many requests') ||
          errorMessage?.toLowerCase().includes('rate limit') ||
          errorMessage?.toLowerCase().includes('request limit') ||
          errorMessage?.toLowerCase().includes('please try again later') ||
          errorMessage?.toLowerCase().includes('too many attempts') ||
          errorMessage?.toLowerCase().includes('rate exceeded') ||
          errorMessage?.toLowerCase().includes('throttled')
        ) {
          // Extract retry time from error message if available, default to 120 seconds
          const retryMatch = errorMessage.match(/(\d+)/);
          const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 120;
          handleRateLimit(retrySeconds);
          setError(
            `You've reached the request limit. Please try again in ${formatRateLimitTime(
              retrySeconds
            )}.`
          );
        } else {
          setError(errorMessage || 'Failed to send OTP. Please try again.');
        }
      } else {
        setError('Failed to send OTP. Please try again.');
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (step === 'otp' && (secondsLeft > 0 || timer > 0)) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [step, secondsLeft, timer]);

  // Cleanup rate limit timer when step changes or component unmounts
  useEffect(() => {
    return () => {
      setIsRateLimited(false);
      setRateLimitTimer(0);
      setRateLimitMessage('');
    };
  }, [step]);

  const handleResendOtp = async () => {
    if (remainingResendTime > 0) return; // Prevent multiple clicks

    setLastResendTime(Date.now());

    try {
      const isMobile = mobileRegex.test(formData.identifier);
      const otpPayload = {
        identifier: formData.identifier,
        password: formData.password,
        ...(isMobile && { phone_code: '+91' }),
      };

      const response = await sendForgetOtp(otpPayload);

      if (response?.responseCode === 'OK') {
        setSecondsLeft(600); // Reset expiration timer
      } else {
        // Handle specific error cases
        const errorMessage =
          response?.message ||
          response?.params?.errmsg ||
          response?.params?.err;

        console.log('Received error message:', errorMessage);

        if (
          errorMessage?.toLowerCase().includes('invalid') ||
          errorMessage?.toLowerCase().includes('not found') ||
          errorMessage?.toLowerCase().includes('does not exist')
        ) {
          setError('Invalid Login ID.');
        } else if (
          errorMessage?.toLowerCase().includes('format') ||
          errorMessage?.toLowerCase().includes('invalid identifier')
        ) {
          setError(
            'The identifier format is invalid. Please enter a valid email, mobile number, or username (3-40 characters, lowercase letters, numbers, hyphens, underscores).'
          );
        } else if (
          errorMessage === 'Too many requests. Please try again later.' ||
          errorMessage?.toLowerCase().includes('too many requests') ||
          errorMessage?.toLowerCase().includes('rate limit') ||
          errorMessage?.toLowerCase().includes('request limit') ||
          errorMessage?.toLowerCase().includes('please try again later') ||
          errorMessage?.toLowerCase().includes('too many attempts') ||
          errorMessage?.toLowerCase().includes('rate exceeded') ||
          errorMessage?.toLowerCase().includes('throttled')
        ) {
          // Extract retry time from error message if available, default to 120 seconds
          const retryMatch = errorMessage.match(/(\d+)/);
          const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 120;
          handleRateLimit(retrySeconds);
          setError(
            `You've reached the request limit. Please try again in ${formatRateLimitTime(
              retrySeconds
            )}.`
          );
        } else {
          setError(errorMessage || 'Failed to resend OTP');
        }
        setShowError(true);
        setLastResendTime(null); // Reset on failure
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);

      // Handle axios error responses
      if (err?.response?.data) {
        const errorData = err.response.data;
        const errorMessage =
          errorData?.message ||
          errorData?.params?.errmsg ||
          errorData?.params?.err;

        console.log('Received error message:', errorMessage);

        if (
          errorMessage?.toLowerCase().includes('invalid') ||
          errorMessage?.toLowerCase().includes('not found') ||
          errorMessage?.toLowerCase().includes('does not exist')
        ) {
          setError('Invalid Login ID.');
        } else if (
          errorMessage?.toLowerCase().includes('format') ||
          errorMessage?.toLowerCase().includes('invalid identifier')
        ) {
          setError(
            'The identifier format is invalid. Please enter a valid email, mobile number, or username (3-40 characters, lowercase letters, numbers, hyphens, underscores).'
          );
        } else if (
          errorMessage === 'Too many requests. Please try again later.' ||
          errorMessage?.toLowerCase().includes('too many requests') ||
          errorMessage?.toLowerCase().includes('rate limit') ||
          errorMessage?.toLowerCase().includes('request limit') ||
          errorMessage?.toLowerCase().includes('please try again later') ||
          errorMessage?.toLowerCase().includes('too many attempts') ||
          errorMessage?.toLowerCase().includes('rate exceeded') ||
          errorMessage?.toLowerCase().includes('throttled')
        ) {
          // Extract retry time from error message if available, default to 120 seconds
          const retryMatch = errorMessage.match(/(\d+)/);
          const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 120;
          handleRateLimit(retrySeconds);
          setError(
            `You've reached the request limit. Please try again in ${formatRateLimitTime(
              retrySeconds
            )}.`
          );
        } else {
          setError(errorMessage || 'Failed to resend OTP');
        }
      } else {
        setError('Failed to resend OTP');
      }
      setShowError(true);
      setLastResendTime(null); // Reset on failure
    }
  };
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');

    if (!otpString) {
      setError('Please enter OTP');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const isMobile = mobileRegex.test(formData.identifier);
      const payload = {
        identifier: formData.identifier,
        ...(isMobile && { phone_code: '+91' }),
        password: formData.password,
        otp: parseInt(otpString),
      };
      console.log(payload, 'verify otp');
      const response = await verifyOtpService(payload);

      if (response?.responseCode === 'OK') {
        setShowSuccess(true);
        //  setTimeout(() => router.push('/'));
      } else {
        // Handle specific error cases
        const errorMessage =
          response?.message ||
          response?.params?.errmsg ||
          response?.params?.err;

        console.log('Received error message:', errorMessage);

        if (
          errorMessage?.toLowerCase().includes('invalid') ||
          errorMessage?.toLowerCase().includes('incorrect') ||
          errorMessage?.toLowerCase().includes('wrong')
        ) {
          setError('Invalid OTP. Please try again.');
        } else if (errorMessage?.toLowerCase().includes('expired')) {
          setError('OTP has expired. Please request a new one.');
        } else {
          setError(errorMessage || 'Failed to verify OTP. Please try again.');
        }
        setShowError(true);
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);

      // Handle axios error responses
      if (err?.response?.data) {
        const errorData = err.response.data;
        const errorMessage =
          errorData?.message ||
          errorData?.params?.errmsg ||
          errorData?.params?.err;

        console.log('Received error message:', errorMessage);

        if (
          errorMessage?.toLowerCase().includes('invalid') ||
          errorMessage?.toLowerCase().includes('incorrect') ||
          errorMessage?.toLowerCase().includes('wrong')
        ) {
          setError('Invalid OTP. Please try again.');
        } else if (errorMessage?.toLowerCase().includes('expired')) {
          setError('OTP has expired. Please request a new one.');
        } else {
          setError(errorMessage || 'Failed to verify OTP. Please try again.');
        }
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Password and confirm password must be the same.');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const payload = formData.identifier;

      // const response = await resetPassword(payload);

      // if (response?.params?.status === 'successful') {
      //   setShowSuccess(true);
      //   setTimeout(() => router.push('/'), 2000);
      // } else {
      //   setError(response?.data?.params?.err ?? 'Failed to reset password');
      //   setShowError(true);
      // }
    } catch (err: any) {
      console.error('Password reset failed:', err); // 👈 Logging the actual error
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to reset password. Please try again.';
      setError(errorMessage);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);

  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleBack = () => {
    if (step === 'otp') {
      setStep('reset');
    } else if (step === 'reset') {
      router.push('/');
    }
  };
  const validatePassword = (val: string, name: string) => {
    if (name === 'password') {
      setNewPassword(val);
      if (!passwordRegex.test(val)) {
        return 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, one special character, and no spaces';
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(val);
      if (val !== newPassword) {
        return 'Password and confirm password must be the same.';
      }
    } else {
      return null;
    }
  };
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    const name = event.target.name;

    // Prevent spaces from being entered
    if (val.includes(' ')) {
      return;
    }

    let errorMsg: string | null | undefined;

    // Update the value in formData first (so we can validate against the latest state)
    const updatedFormData = {
      ...formData,
      [name]: val,
    };
    setFormData(updatedFormData);

    if (name === 'password') {
      errorMsg = validatePassword(val, name);
    } else if (name === 'confirmPassword') {
      errorMsg = validatePassword(val, name);
    }

    const updatedErrors = {
      ...formErrors,
      [name]: errorMsg ?? '',
    };

    // ✅ Validate confirmPassword when password changes
    if (
      name === 'password' &&
      updatedFormData.confirmPassword &&
      val !== updatedFormData.confirmPassword
    ) {
      updatedErrors.confirmPassword =
        'Password and confirm password must be the same.';
    }

    // ✅ Validate confirmPassword when confirmPassword changes
    if (
      name === 'confirmPassword' &&
      updatedFormData.password &&
      val !== updatedFormData.password
    ) {
      updatedErrors.confirmPassword =
        'Password and confirm password must be the same.';
    }

    // ✅ Clear error if they now match
    if (
      updatedFormData.password &&
      updatedFormData.confirmPassword &&
      updatedFormData.password === updatedFormData.confirmPassword
    ) {
      updatedErrors.confirmPassword = '';
    }

    setFormErrors(updatedErrors);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus to next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatRateLimitTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  const handlePaste = (e: any) => {
    const pasteData = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits); // assuming `otp` is a state array of length 6
      e.preventDefault();
    }
  };

  const handlePasteIdentifier = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');

    // If the current identifier starts with 6-9, treat as mobile
    if (/^[6-9]/.test(formData.identifier)) {
      // Only allow digits for mobile numbers
      if (!/^\d+$/.test(pasteData)) {
        e.preventDefault();
        return;
      }

      // Limit to 10 digits total
      const currentLength = formData.identifier.length;
      const remainingSpace = 10 - currentLength;
      if (pasteData.length > remainingSpace) {
        e.preventDefault();
        return;
      }
    }

    // For email or username, validate against the appropriate regex
    if (!/^[6-9]/.test(formData.identifier)) {
      // If current value or paste data contains @, treat as email
      if (formData.identifier.includes('@') || pasteData.includes('@')) {
        // Allow paste - will be validated in handleInputChange
        return;
      }

      // For username, allow letters, numbers, hyphens, underscores, dots
      if (!/^[a-zA-Z0-9._-]+$/.test(pasteData)) {
        e.preventDefault();
        return;
      }
    }
  };

  const handleInputIdentifier = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    // If the current identifier starts with 6-9, treat as mobile
    if (/^[6-9]/.test(value)) {
      // Remove any non-digit characters
      const cleanedValue = value.replace(/\D/g, '');

      // Limit to 10 digits
      if (cleanedValue.length > 10) {
        target.value = cleanedValue.slice(0, 10);
      }
    } else if (value.includes('@')) {
      // For email, allow full input - validation happens in handleInputChange
      return;
    } else {
      // For username, enforce max length of 40 characters
      if (value.length > 40) {
        target.value = value.slice(0, 40);
      }
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f5f5, #f5f5f5)',
        minHeight: '100vh',
        padding: 2,
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
            borderRadius: 'inherit',
            padding: '4px',
            background: 'linear-gradient(to right, #FF9911 50%, #582E92 50%)',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          },
        }}
      >
        <Grid item xs={12} textAlign="left">
          <Button
            onClick={handleBack}
            sx={{
              color: '#572E91',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              textTransform: 'none',
              justifyContent: 'flex-start',
              '&:hover': {
                backgroundColor: '#F5F5F5',
              },
            }}
          >
            <ArrowBackIcon sx={{ marginRight: '4px' }} />
            Back
          </Button>
        </Grid>
        {step === 'otp' && (
          <>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width="100%"
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1" gutterBottom>
                  Enter the OTP sent to {formData.identifier}
                </Typography>
              </Box>

              <Box
                display="flex"
                gap={1}
                justifyContent="center"
                width="95%"
                m={2}
              >
                {otp.map((digit, index) => (
                  <TextField
                    key={`otp-${index}`}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    inputProps={{
                      maxLength: 1,
                      sx: {
                        textAlign: 'center',
                        fontSize: { xs: 10, sm: 20 },
                        width: { xs: 30, sm: 40 },
                      },
                    }}
                  />
                ))}
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width="100%"
                mt={1}
              >
                <Typography variant="body2" color="textSecondary">
                  Didn’t receive the code?
                </Typography>
                <Button
                  onClick={handleResendOtp}
                  disabled={remainingResendTime > 0 || isRateLimited}
                  variant="text"
                  sx={{
                    color:
                      remainingResendTime > 0 || isRateLimited
                        ? 'grey'
                        : '#582E92',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '14px',
                  }}
                >
                  {isRateLimited
                    ? `Try again in ${formatRateLimitTime(rateLimitTimer)}`
                    : remainingResendTime > 0
                    ? `Resend OTP in ${formatTime(remainingResendTime)}`
                    : 'Resend OTP'}
                </Button>

                {isRateLimited && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 'medium',
                      mt: 1,
                    }}
                  >
                    {rateLimitMessage}
                  </Typography>
                )}
              </Box>

              <Typography variant="body2" color="textSecondary">
                Note: OTP will expire in 10 minutes ({formatTime(secondsLeft)}{' '}
                left).
              </Typography>

              {/* ✅ This ensures it appears on a new line */}
              <Box display="flex" justifyContent="center" mt={2} width="100%">
                <Button
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={!otp.join('').trim()}
                  sx={{
                    bgcolor: '#582E92',
                    color: '#FFFFFF',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '8px 32px',
                    '&:hover': {
                      bgcolor: '#543E98',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                </Button>
              </Box>
            </Box>
          </>
        )}

        {step === 'reset' && (
          <>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Forgot Password
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Email/Mobile/Username"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                // Prevent entering digits 0-5 at the beginning for mobile numbers
                if (formData.identifier.length === 0 && /^[0-5]$/.test(e.key)) {
                  e.preventDefault();
                }
                // For mobile numbers, only allow digits after the first character
                if (
                  /^[6-9]/.test(formData.identifier) &&
                  !/^\d$/.test(e.key) &&
                  e.key !== 'Backspace' &&
                  e.key !== 'Delete' &&
                  e.key !== 'Tab' &&
                  e.key !== 'ArrowLeft' &&
                  e.key !== 'ArrowRight' &&
                  e.key !== 'ArrowUp' &&
                  e.key !== 'ArrowDown'
                ) {
                  e.preventDefault();
                }
                // For usernames (not mobile), allow email characters or username characters
                if (
                  !/^[6-9]/.test(formData.identifier) &&
                  !/^[a-zA-Z0-9@._+-]$/.test(e.key) &&
                  e.key !== 'Backspace' &&
                  e.key !== 'Delete' &&
                  e.key !== 'Tab' &&
                  e.key !== 'ArrowLeft' &&
                  e.key !== 'ArrowRight' &&
                  e.key !== 'ArrowUp' &&
                  e.key !== 'ArrowDown'
                ) {
                  e.preventDefault();
                }
              }}
              onPaste={handlePasteIdentifier}
              onInput={handleInputIdentifier}
              margin="normal"
              error={!!formErrors.identifier}
              helperText={formErrors.identifier || ''}
              FormHelperTextProps={{
                sx: {
                  color: formErrors.identifier ? 'red' : 'text.secondary',
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              InputProps={{
                inputProps: /^[6-9]/.test(formData.identifier)
                  ? {
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      maxLength: 10,
                    }
                  : undefined,
                sx: {
                  '& .MuiInputBase-input': {
                    padding: '14px',
                    fontSize: '12px',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  '&.Mui-focused': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'} // ✅ toggle based on state
              name="password"
              label="New Password"
              value={formData.password}
              onChange={handleChangePassword}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.preventDefault();
                }
              }}
              helperText={formErrors.password ?? ''}
              margin="normal"
              FormHelperTextProps={{
                sx: {
                  color: formErrors.password ? 'red' : 'inherit',
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowNewPassword}
                      edge="end"
                    >
                      {showNewPassword ? <Visibility /> : <VisibilityOff />}{' '}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  '& .MuiInputBase-input': {
                    padding: '14px',
                    fontSize: '12px',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  '&.Mui-focused': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChangePassword}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.preventDefault();
                }
              }}
              helperText={formErrors.confirmPassword ?? ''}
              margin="normal"
              FormHelperTextProps={{
                sx: {
                  color: formErrors.confirmPassword ? 'red' : 'inherit',
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}{' '}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  '& .MuiInputBase-input': {
                    padding: '14px',
                    fontSize: '12px',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  '&.Mui-focused': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOtp}
              // onClick={handleResetPassword}
              disabled={
                loading ||
                isRateLimited ||
                !formData.password ||
                !formData.confirmPassword ||
                !formData.identifier ||
                !validateIdentifierFormat(formData.identifier) ||
                !!formErrors.identifier ||
                !!formErrors.password ||
                !!formErrors.confirmPassword
              }
              sx={{
                bgcolor: isRateLimited ? '#cccccc' : '#582E92',
                color: '#FFFFFF',
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '8px 16px',
                '&:hover': {
                  bgcolor: isRateLimited ? '#cccccc' : '#543E98',
                },
                width: { xs: '50%', sm: '50%' },
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : isRateLimited ? (
                `Try again in ${formatRateLimitTime(rateLimitTimer)}`
              ) : (
                'Send OTP'
              )}
            </Button>

            {isRateLimited && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'medium',
                  }}
                >
                  {rateLimitMessage}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: '11px',
                    mt: 0.5,
                  }}
                >
                  Please wait before requesting another OTP
                </Typography>
              </Box>
            )}
          </>
        )}

        {showError && (
          <Snackbar
            open={showError}
            autoHideDuration={4000}
            onClose={() => setShowError(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              severity="error"
              onClose={() => setShowError(false)}
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          </Snackbar>
        )}

        <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
          <DialogTitle>Password Reset Successful</DialogTitle>
          <DialogContent>
            <Typography>Your password has been reset successfully.</Typography>
          </DialogContent>
          <DialogActions>
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
                width: { xs: '50%', sm: '50%' },
              }}
              onClick={() => router.push('/')}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
};

export default PasswordReset;