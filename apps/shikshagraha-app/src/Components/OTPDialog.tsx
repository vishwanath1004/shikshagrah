import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close, Refresh } from '@mui/icons-material';
interface OTPDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  onResendOtp?: () => void;
  loading?: boolean;
  error?: string;
  otpLength?: number;
  resendCooldown?: number;
  expirationTime?: number;
}
const OTPDialog: React.FC<OTPDialogProps> = ({
  open,
  onClose,
  onSubmit,
  onResendOtp,
  loading = false,
  error = '',
  otpLength = 6,
  resendCooldown = 30,
  expirationTime = 600, // 10 minutes in seconds
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [expirationTimer, setExpirationTimer] =
    useState<number>(expirationTime);
  // Handle resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
  // Handle expiration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open && expirationTimer > 0) {
      interval = setInterval(() => {
        setExpirationTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, expirationTimer]);
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setOtp(Array(otpLength).fill(''));
      setResendTimer(0);
      setExpirationTimer(expirationTime);
    }
  }, [open, otpLength, expirationTime]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const minPart = mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : '';
    const secPart = secs > 0 ? `${secs} second${secs > 1 ? 's' : ''}` : '';

    // Combine parts with space if both are present
    return [minPart, secPart].filter(Boolean).join(' ');
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < otpLength - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, otpLength);
    const newOtp = [...otp];
    pasteData.split('').forEach((char, i) => {
      if (i < otpLength && /^\d?$/.test(char)) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);
  };
  const handleSubmit = () => {
    onSubmit(otp.join(''));
  };
  const handleResend = () => {
    if (onResendOtp && resendTimer === 0) {
      onResendOtp();
      setResendTimer(resendCooldown);
      setExpirationTimer(expirationTime);
    }
  };
  const isOTPComplete =
    otp.every((digit) => digit !== '') && otp.length === otpLength;
  const isExpired = expirationTimer <= 0;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 'inherit',
            background: 'linear-gradient(to right, #FF9911, #582E92)',
            zIndex: -1,
          },
        },
      }}
    >
      <Box position="absolute" top={8} right={8}>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Enter Verification Code
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          We've sent a {otpLength}-digit code to your registered contact
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 0 }}>
        <Box
          display="flex"
          justifyContent="center"
          gap={isMobile ? 1 : 2}
          my={3}
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <TextField
              key={index}
              id={`otp-${index}`}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: isMobile ? 20 : 24,
                  padding: isMobile ? '8px' : '12px',
                },
              }}
              sx={{
                width: isMobile ? 48 : 56,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: error ? 'error.main' : 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
              disabled={loading || isExpired}
            />
          ))}
        </Box>
        {error && (
          <Typography
            color="error.main"
            textAlign="center"
            variant="body2"
            mt={1}
          >
            {error}
          </Typography>
        )}
        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Didn't receive the code?
          </Typography>
          <Button
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
            startIcon={<Refresh fontSize="small" />}
            sx={{
              textTransform: 'none',
              minWidth: 0,
              color: resendTimer > 0 ? 'text.disabled' : 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, flexDirection: 'column' }}>
        <Button
          fullWidth
          onClick={handleSubmit}
          variant="contained"
          disabled={!isOTPComplete || loading || isExpired}
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
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isExpired ? (
            'OTP Expired'
          ) : (
            'Verify'
          )}
        </Button>
        {expirationTimer > 0 && (
          <Typography variant="caption" color="text.secondary" mt={2}>
            Code expires in {formatTime(expirationTimer)}
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default OTPDialog;
