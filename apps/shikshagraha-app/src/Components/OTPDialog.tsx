import React, { useEffect, useState, useRef } from 'react';
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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

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
      setIsAutoFilling(false);
    }
  }, [open, otpLength, expirationTime]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, otpLength);
  }, [otpLength]);

  // Auto-focus first input when dialog opens
  useEffect(() => {
    if (open && inputRefs.current[0]) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

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
      const nextInput = inputRefs.current[index + 1];
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
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
    setIsAutoFilling(true);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : otpLength - 1;
    const nextInput = inputRefs.current[focusIndex];
    nextInput?.focus();

    // Reset auto-filling flag after a short delay
    setTimeout(() => setIsAutoFilling(false), 100);
  };

  // Handle cross-platform auto-fill and keyboard suggestions
  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    // Handle auto-fill or keyboard suggestions (multiple digits)
    if (value.length > 1) {
      const digits = value.slice(0, otpLength).split('');
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        if (i < otpLength && /^\d?$/.test(digit)) {
          newOtp[i] = digit;
        }
      });

      setOtp(newOtp);
      setIsAutoFilling(true);

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((digit) => digit === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : otpLength - 1;
      const nextInput = inputRefs.current[focusIndex];
      nextInput?.focus();

      // Reset auto-filling flag after a short delay
      setTimeout(() => setIsAutoFilling(false), 100);
    }
  };

  // Handle composition events for better mobile support (Android/Chinese keyboards)
  const handleCompositionEnd = (
    index: number,
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    if (value.length > 1) {
      const digits = value.slice(0, otpLength).split('');
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        if (i < otpLength && /^\d?$/.test(digit)) {
          newOtp[i] = digit;
        }
      });

      setOtp(newOtp);
      setIsAutoFilling(true);

      // Reset auto-filling flag after a short delay
      setTimeout(() => setIsAutoFilling(false), 100);
    }
  };

  // Handle Android-specific auto-fill events
  const handleAnimationStart = (e: React.AnimationEvent<HTMLInputElement>) => {
    // Android Chrome triggers animation events during auto-fill
    if (e.animationName === 'mui-auto-fill') {
      setIsAutoFilling(true);
    }
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

  const handleDialogClose = (
    event: {},
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason === 'backdropClick') {
      return; // Prevent closing on backdrop click
    }
    onClose(); // Allow closing on escape key or close button
  };

  const isOTPComplete =
    otp.every((digit) => digit !== '') && otp.length === otpLength;
  const isExpired = expirationTimer <= 0;

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown={false}
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
          ref={containerRef}
          display="flex"
          justifyContent="center"
          gap={isMobile ? 1 : 2}
          my={3}
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onInput={(e: React.FormEvent<HTMLInputElement>) =>
                handleInput(index, e)
              }
              onCompositionEnd={(e: React.CompositionEvent<HTMLInputElement>) =>
                handleCompositionEnd(index, e)
              }
              onAnimationStart={handleAnimationStart}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{
                maxLength: otpLength, // Allow multiple digits for auto-fill
                style: {
                  textAlign: 'center',
                  fontSize: isMobile ? 20 : 24,
                  padding: isMobile ? '8px' : '12px',
                },
                // Cross-platform auto-fill attributes
                autoComplete: 'one-time-code',
                inputMode: 'numeric',
                pattern: '[0-9]*',
                // Android-specific attributes
                'data-lpignore': 'true',
                'data-1p-ignore': 'true',
                'data-form-type': 'other',
                // Additional Android auto-fill hints
                'data-autocomplete': 'one-time-code',
                // iOS-specific attributes
                'data-ios': 'true',
                // Accessibility
                'aria-label': `OTP digit ${index + 1}`,
                'aria-describedby': error ? 'otp-error' : undefined,
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
                // Cross-platform styles to prevent zoom and improve UX
                '& .MuiInputBase-input': {
                  fontSize: '12px !important',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  WebkitAppearance: 'none',
                  borderRadius: '0',
                  // Android-specific styles
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button':
                    {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  // Firefox
                  '&[type=number]': {
                    MozAppearance: 'textfield',
                  },
                  // Prevent text selection during auto-fill
                  ...(isAutoFilling && {
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }),
                },
                // Android Chrome auto-fill styles
                '& .MuiInputBase-root': {
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  // Handle Android auto-fill background
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px white inset',
                    WebkitTextFillColor: '#000',
                  },
                },
              }}
              disabled={loading || isExpired}
            />
          ))}
        </Box>
        {error && (
          <Typography
            id="otp-error"
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
