// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { useTranslation } from 'react-i18next';
import { FormHelperText } from '@mui/material';

const CustomMultiSelectWidget = ({
  id,
  options,
  value = [],
  required,
  label,
  onChange,
  schema,
  uiSchema,
}: // rawErrors = [],
WidgetProps) => {
  const enumOptions =
    uiSchema?.['ui:options']?.enumOptions ?? (options.enumOptions || []);
  const maxSelections = schema.maxSelection ?? enumOptions.length;
  const { t } = useTranslation();
  const lowerLabel = label?.toLowerCase();
  const isRoleField = lowerLabel === 'sub-role';
  const helperText = ' Please select a sub role.';
  const selectedValues = Array.isArray(value) ? value : [];

  const [isAllSelected, setIsAllSelected] = useState(
    selectedValues.length === enumOptions.length
  );

  const isDisabled = uiSchema?.['ui:disabled'] === true;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsAllSelected(selectedValues.length === enumOptions.length);
  }, [selectedValues, enumOptions]);

  const handleChange = (event: any) => {
    const selected = event.target.value;

    if (selected.includes('selectAll')) {
      if (isAllSelected) {
        onChange([]);
      } else {
        const allValues = enumOptions.map((option) => option.value);
        onChange(allValues.slice(0, maxSelections));
      }
    } else {
      if (Array.isArray(selected)) {
        if (selected.length <= maxSelections) {
          onChange(selected.length > 0 ? selected : []);
          if (maxSelections === 1 && selected.length === 1) {
            setOpen(false);
          }
        }
      }
    }
  };

  return (
    <FormControl
      fullWidth
      // error={rawErrors.length > 0}
      // required={required}
      disabled={isDisabled}
      error={false}
    >
      <InputLabel
        id="demo-multiple-checkbox-label"
        sx={{
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
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
        {label}
        {isRoleField && <span style={{ color: 'red' }}>&nbsp;*</span>}
      </InputLabel>

      <Select
        id={id}
        multiple
        label={label}
        labelId="demo-multiple-checkbox-label"
        value={selectedValues}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onChange={handleChange}
        renderValue={(selected) =>
          enumOptions
            .filter((option) => selected.includes(option.value))
            .map((option) => option.label)
            .join(', ')
        }
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: '300px',
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
        error={false}
      >
        {enumOptions.length > 1 && maxSelections >= enumOptions.length && (
          <MenuItem
            key="selectAll"
            value="selectAll"
            disabled={enumOptions.length === 1}
          >
            <Checkbox checked={isAllSelected} />
            <ListItemText
              primary={isAllSelected ? 'Deselect All' : 'Select All'}
            />
          </MenuItem>
        )}

        {enumOptions
          .filter((option) => option.value !== 'Select')
          .map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={
                selectedValues.length >= maxSelections &&
                !selectedValues.includes(option.value)
              }
            >
              <Checkbox checked={selectedValues.includes(option.value)} />
              <ListItemText
                primary={t(`FORM.${option.label}`, {
                  defaultValue: option.label,
                })}
              />
            </MenuItem>
          ))}
      </Select>
      {helperText && !value && (
        <FormHelperText
          sx={{
            color: 'red',
            fontSize: '11px',
            marginLeft: '0px',
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default CustomMultiSelectWidget;
