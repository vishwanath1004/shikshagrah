// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import { WidgetProps } from '@rjsf/utils';
import { Visibility, VisibilityOff } from '@mui/icons-material';
const CustomTextFieldWidget = (props: WidgetProps) => {
  const {
    id,
    label,
    value,
    required,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
    rawErrors = [],
    placeholder,
    formContext,
  } = props;
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const formData = formContext?.formData || {};
  const isPasswordField = label?.toLowerCase() === 'password';
  const isConfirmPasswordField = label
    ?.toLowerCase()
    .includes('confirm password');
  const isEmailField = label?.toLowerCase() === 'email';
  const isMobileField =
    label?.toLowerCase() === 'mobile' ||
    label?.toLowerCase() === 'contact number';
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}:":;'<>?,./\\])(?!.*\s).{8,}$/;
  const nameRegex = /^[a-zA-Z]+$/;
  const contactRegex = /^[6-9]\d{9}$/;
  const udiseRegex = /^\d{11}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const usernameRegex =
    /^(?:[a-z0-9_-]{3,40}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/;
  const registrationCodeRegex = /^[a-zA-Z0-9_]+$/;
  const lowerLabel = label?.toLowerCase();
  const isOptional = () => {
    if (isEmailField && formData.mobile) return true;
    if (isMobileField && formData.email) return true;
    return false;
  };
  const isActuallyRequired = () => {
    if (isEmailField) return !formData.mobile && required;
    if (isMobileField) return !formData.email && required;
    return required;
  };
  const validateField = (field: string, val: string): string | null => {
    if (isOptional() && !val) return null;
    console.log('field', field);
    if (field.toLowerCase() === 'last name' && !val) {
      return null;
    }
    switch (field.toLowerCase()) {
      case 'first name':
        if (!nameRegex.test(val)) return 'Only letters are allowed.';
        break;
      case 'last name':
        if (val && !nameRegex.test(val)) return 'Only letters are allowed.';
        break;
      case 'username':
        if (!usernameRegex.test(val))
          return 'Please enter a valid username. It can be either a valid email address or a custom username (3-40 characters, lowercase letters and numbers only, with hyphens and underscores allowed)';
        break;
      case 'contact number':
        if (val && !contactRegex.test(val)) {
          return 'Enter a valid 10-digit mobile number';
        }
        // Don't require if email is provided
        if (!val && !formData.email) {
          return 'Either contact number or email is required';
        }
        return null;
        break;
        break;
      case 'email':
        if (val && !emailRegex.test(val)) {
          return 'Enter a valid email address';
        }
        // Don't require if mobile is provided
        if (!val && !formData.mobile) {
          return 'Either email or contact number is required';
        }
        return null;
        break;
      case 'registration code':
        if (!registrationCodeRegex.test(val))
          return 'Registration code may only contain letters, numbers and underscore.';
        break;
      case 'password':
        // Check for any whitespace
        if (val.includes(' ')) {
          return 'Password cannot contain spaces.';
        }
        if (!passwordRegex.test(val))
          return 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
        break;
      case 'confirm password':
        // Check for any whitespace
        if (val.includes(' ')) {
          return 'Confirm password cannot contain spaces.';
        }
        if (val !== formData.password)
          return 'Password and confirm password must be the same.';
        break;
    }
    return null;
  };
  useEffect(() => {
    if (isConfirmPasswordField && value) {
      const error = validateField(label ?? '', value);
      setLocalError(error);
    }
  }, [formData.password]);
  const shouldShowHelperText = () => {
    // Always show if there are validation errors
    if (displayErrors.length > 0 || localError) {
      return true;
    }

    // Always show for non-email/mobile fields
    if (!isEmailField && !isMobileField) return true;

    // For email field - only show if mobile isn't entered
    if (isEmailField) return !formData.mobile || (value && localError);

    // For mobile field - only show if email isn't entered
    if (isMobileField) return !formData.email || (value && localError);

    return true;
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (isMobileField) {
      // Remove any non-digit characters
      const numericValue = val.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedValue = numericValue.slice(0, 10);
      const error = validateField(label ?? '', limitedValue);
      setLocalError(error);
      onChange(limitedValue === '' ? undefined : limitedValue);
      if (limitedValue && formData.email) {
        props.onClearError?.('email');
      }
      return;
    }
    if (isEmailField) {
      const error = validateField(label ?? '', val);
      setLocalError(error);
      onChange(val === '' ? undefined : val);
      // Clear mobile error when email is entered
      if (val && formData.mobile) {
        props.onClearError?.('mobile');
      }
      return;
    }

    // Handle username field - limit to 40 characters
    if (lowerLabel === 'username') {
      const limitedValue = val.slice(0, 40);
      const error = validateField(label ?? '', limitedValue);
      setLocalError(error);
      onChange(limitedValue === '' ? undefined : limitedValue);
      if (props.onErrorChange) {
        props.onErrorChange(!!error);
      }
      return;
    }

    // Handle password fields - remove all spaces and validate
    if (isPasswordField || isConfirmPasswordField) {
      const noSpaceVal = val.replace(/\s/g, '');
      const error = validateField(label ?? '', noSpaceVal);
      setLocalError(error);
      // Store the value without spaces to prevent spaces in form data
      onChange(noSpaceVal === '' ? undefined : noSpaceVal);
      if (props.onErrorChange) {
        props.onErrorChange(!!error);
      }
      return;
    }

    const error = validateField(label ?? '', val);
    setLocalError(error);
    onChange(val === '' ? undefined : val);
    if (props.onErrorChange) {
      props.onErrorChange(!!error);
    }
  };
  const handleBlur = () => {
    if (onBlur) onBlur(id, value);
  };
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    onFocus(id, event.target.value);
  // Filter out 'is a required property' messages
  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const renderLabel = () => {
    if (
      [
        'first name',
        'username',
        'password',
        'confirm password',
        'registration code',
      ].includes(lowerLabel ?? '')
    ) {
      return (
        <>
          {label} <span style={{ color: 'red' }}>*</span>
        </>
      );
    }
    if (isEmailField || isMobileField) {
      return (
        <>
          {label}
          {isActuallyRequired() && <span style={{ color: 'red' }}>*</span>}
          {isOptional() && (
            <span style={{ color: 'gray', fontSize: '0.8em' }}>
              {' '}
              (optional)
            </span>
          )}
        </>
      );
    }
    if (isConfirmPasswordField) {
      return (
        <>
          {label}
          {formData.password && <span style={{ color: 'red' }}>*</span>}
        </>
      );
    }
    return label;
  };
  return (
    <>
      {/* Hidden fields to prevent autofill */}
      <input
        type="text"
        name="prevent_autofill_username"
        style={{ display: 'none' }}
      />
      <input
        type="password"
        name="prevent_autofill_password"
        style={{ display: 'none' }}
      />
      <TextField
        fullWidth
        id={id}
        label={renderLabel()}
        value={
          typeof value === 'object' && value !== null ? value.name : value ?? ''
        }
        type={
          (isPasswordField || isConfirmPasswordField) && !showPassword
            ? 'password'
            : 'text'
        }
        required={required}
        disabled={disabled || readonly}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        error={displayErrors.length > 0 || !!localError}
        helperText={
          shouldShowHelperText()
            ? localError || (displayErrors.length > 0 ? displayErrors[0] : '')
            : ''
        }
        variant="outlined"
        size="small"
        autoComplete={
          isPasswordField || isConfirmPasswordField ? 'new-password' : 'off'
        }
        FormHelperTextProps={{
          sx: {
            color:
              displayErrors.length > 0 || localError
                ? 'error.main'
                : 'text.secondary',
            fontSize: '11px',
            marginLeft: '0px',
          },
        }}
        InputProps={{
          readOnly: readonly,
          inputMode: isMobileField ? 'numeric' : 'text',
          pattern: isMobileField ? '[0-9]*' : undefined,
          autoComplete:
            isPasswordField || isConfirmPasswordField ? 'new-password' : 'off',
          name:
            isPasswordField || isConfirmPasswordField
              ? 'login-password'
              : 'login-username',
          sx: {
            '& .MuiInputBase-input': {
              padding: '10px 12px',
              fontSize: '12px !important', // Ensure 16px font size to prevent iOS zoom
              color: readonly ? '#000000' : undefined,
              backgroundColor: readonly ? '#f5f5f5' : undefined,
              WebkitTextFillColor: readonly ? '#000000' : undefined,
              // iOS Safari zoom prevention
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              WebkitAppearance: 'none',
              borderRadius: '0',
              // Prevent zoom on focus
              '@media screen and (-webkit-min-device-pixel-ratio: 0)': {
                fontSize: '12px !important',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: readonly ? 'rgba(0, 0, 0, 0.23)' : undefined,
            },
            // Additional iOS fixes
            '& .MuiInputBase-root': {
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
            },
          },
          endAdornment: (isPasswordField || isConfirmPasswordField) && (
            <InputAdornment position="end">
              <IconButton onClick={toggleShowPassword} edge="end" size="small">
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
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
      {(isEmailField || isMobileField) &&
        !value &&
        !localError &&
        !displayErrors.length && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#666',
              fontSize: '11px',
              marginTop: '4px',
              marginLeft: '12px',
            }}
          >
            {isEmailField
              ? 'Enter email'
              : isMobileField
              ? 'Enter contact number'
              : 'Enter either Email or Contact number'}
          </Typography>
        )}
    </>
  );
};
export default CustomTextFieldWidget;
