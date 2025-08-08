import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { useTranslation } from 'react-i18next';
import { FormHelperText } from '@mui/material';
import { getSubroles } from '../../services/LoginService';

interface EnumOption {
  value: string;
  label: string;
  _originalData?: any;
  disabled?: boolean;
}

const CustomSingleSelectWidget = ({
  id,
  options,
  value = '',
  required,
  label,
  onChange,
  schema,
  uiSchema,
  rawErrors = [],
  onSubrolesChange,
}: WidgetProps & { onSubrolesChange?: (subroles: any[]) => void }) => {
  // Enhanced options resolution
  const enumOptions: EnumOption[] = React.useMemo(() => {
    // 1. First check uiSchema options (most reliable)
    if (uiSchema?.['ui:options']?.enumOptions) {
      return (uiSchema['ui:options'].enumOptions as EnumOption[]) || [];
    }

    // 2. Check direct options prop
    if (options?.enumOptions) {
      return (options.enumOptions as EnumOption[]) || [];
    }

    // 3. Fallback to schema.enum + enumNames (legacy support)
    if (schema.enum && schema.enumNames) {
      return schema.enum.map((value: any, index: number) => ({
        value: String(value),
        label: schema.enumNames[index] ?? String(value),
      }));
    }

    // 4. Final fallback - schema.enum only
    if (schema.enum) {
      return schema.enum.map((value: any) => ({
        value: String(value),
        label: String(value),
      }));
    }

    return [];
  }, [uiSchema, options, schema]);

  console.log('enumOptions', enumOptions);
  const { t } = useTranslation();
  const [subRolesVisible, setSubRolesVisible] = useState(false);
  const [subRoles, setSubRoles] = useState<any[]>([]);
  const isDisabled = uiSchema?.['ui:disabled'] === true;
  const isEmptyOptionIncluded = schema?.allowEmptyOption || false;
  const lowerLabel = label?.toLowerCase();
  const isRoleField = lowerLabel === 'role';
  const helperText = 'Please select a role.';

  // Filter out 'is a required property' messages
  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );

  const handleChange = async (event: any) => {
    const selected = event.target.value;
    const selectedOption = enumOptions.find(
      (option: EnumOption) => option.value === selected
    );

    // Always use externalId for the value
    const valueToSend = selectedOption?._originalData?._id ?? selected;

    onChange(selected);

    if (isRoleField && selected) {
      try {
        const roleIdToFetch = selectedOption?._originalData?._id;
        localStorage.setItem('role', roleIdToFetch); //

        if (roleIdToFetch) {
          const subrolesResponse = await getSubroles(roleIdToFetch);
          const subrolesData = subrolesResponse.result ?? [];

          const formattedSubroles = subrolesData?.data?.map((subrole: any) => ({
            value: subrole._id,
            label: subrole.name,
            _originalData: subrole,
          }));

          if (onSubrolesChange) {
            onSubrolesChange(formattedSubroles);
          }
        }
      } catch (error) {
        console.error('Error fetching subroles:', error);
        if (onSubrolesChange) {
          onSubrolesChange([]);
        }
      }
    }
  };

  useEffect(() => {
    // if (value === 'HT & Officials') {
    setSubRolesVisible(true);
    // }
  }, [value]);

  // Determine what helper text to show
  const getHelperText = () => {
    // Show validation errors first
    if (displayErrors.length > 0) {
      return displayErrors[0];
    }

    // Show helper text for role field when no value is selected
    if (isRoleField && !value) {
      return helperText;
    }

    // Show required field message for other fields when no value is selected
    if (required && !value) {
      return `${label} is required`;
    }

    return '';
  };

  const shouldShowHelperText = () => {
    return getHelperText() !== '';
  };

  return (
    <FormControl
      fullWidth
      size="small"
      disabled={isDisabled}
      error={rawErrors && rawErrors.length > 0}
    >
      <InputLabel
        id={`${id}-label`}
        sx={{
          fontSize: '12px',
          '&.Mui-focused': {
            transform: 'translate(14px, -6px) scale(0.75)',
            color: '#582E92',
          },
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
            color: '#582E92',
          },
        }}
      >
        {isRoleField ? (
          <>
            {label}
            <span style={{ color: 'red' }}> *</span>
          </>
        ) : (
          label
        )}
      </InputLabel>

      <Select
        id={id}
        labelId={`${id}-label`}
        value={value ?? ''}
        onChange={handleChange}
        displayEmpty
        label={label}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
              zIndex: 1300, // Ensure dropdown appears above other elements
            },
          },
        }}
        sx={{
          '& .MuiSelect-select': {
            padding: '10px 12px',
            fontSize: '12px !important', // Ensure 16px font size to prevent iOS zoom
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
          // Additional iOS fixes
          '& .MuiInputBase-root': {
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
          },
        }}
      >
        {isEmptyOptionIncluded && (
          <MenuItem value="">
            <em>
              {t('FORM.Select')}
              {required && '*'}
            </em>
          </MenuItem>
        )}

        {enumOptions.length > 0 ? (
          enumOptions.map((option: EnumOption) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No options available</MenuItem>
        )}
      </Select>

      {shouldShowHelperText() && (
        <FormHelperText
          sx={{
            color:
              rawErrors && rawErrors.length > 0
                ? 'error.main'
                : 'text.secondary',
            fontSize: '11px',
            marginLeft: '0px',
          }}
        >
          {getHelperText()}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default CustomSingleSelectWidget;
