// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { Box, Button } from '@mui/material';
import {
  TextField,
  Container,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import _ from 'lodash'; // Lodash for deep comparison
import CustomMultiSelectWidget from './RJSFWidget/CustomMultiSelectWidget';
import CustomCheckboxWidget from './RJSFWidget/CustomCheckboxWidget';
import CustomDateWidget from './RJSFWidget/CustomDateWidget';
import SearchTextFieldWidget from './RJSFWidget/SearchTextFieldWidget';
import CustomSingleSelectWidget from './RJSFWidget/CustomSingleSelectWidget';
import CustomRadioWidget from './RJSFWidget/CustomRadioWidget';
import CustomTextFieldWidget from './RJSFWidget/CustomTextFieldWidget';
import {
  calculateAgeFromDate,
  toPascalCase,
  transformLabel,
} from '../utils/Helper';
import UdiaseWithButton from './RJSFWidget/UdiaseWithButton';
import CustomEmailWidget from './RJSFWidget/CustomEmailWidget';
import {
  authenticateLoginUser,
  authenticateUser,
  fetchTenantData,
  schemaRead,
  signin,
  registerUserService,
  sendOtp,
  verifyOtpService,
} from '../services/LoginService';
import { useRouter } from 'next/navigation';
import OTPDialog from './OTPDialog';
import { API_ENDPOINTS } from '../utils/API/APIEndpoints';

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { uiSchema } = props;
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return <button type="submit" style={{ display: 'none' }}></button>;
};

const DynamicForm = ({
  schema,
  uiSchema,
  SubmitaFunction,
  isCallSubmitInHandle,
  prefilledFormData,
  FormSubmitFunction,
  extraFields,
  hideSubmit,
  onChange,
  fieldIdMapping,
}: any) => {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const [formSchema, setFormSchema] = useState(schema);
  const [formUiSchemaOriginal, setFormUiSchemaOriginal] = useState(uiSchema);
  const [formUiSchema, setFormUiSchema] = useState(uiSchema);
  const [formData, setFormData] = useState({});
  const [dependentSchema, setDependentSchema] = useState([]);
  const [isInitialCompleted, setIsInitialCompleted] = useState(false);
  const [hideAndSkipFields, setHideAndSkipFields] = useState({});
  const [isRenderCompleted, setIsRenderCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailMobileError, setShowEmailMobileError] = useState('');
  const [requestData, setRequestData] = useState<any>({});
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [isOpenOTP, setIsOpenOTP] = useState(false);
  const [registerData, setRegisterData] = useState<any>({});
  const [hashCode, setHashCode] = useState('');
  const [subroles, setSubroles] = useState<any[]>([]);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [errorButton, setErrorButton] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [lastOtpAttemptTime, setLastOtpAttemptTime] = useState<number | null>(
    null
  );
  const [otpDisabled, setOtpDisabled] = useState(false);
  const [otpDisabledMessage, setOtpDisabledMessage] = useState('');
  const [tooManyRequests, setTooManyRequests] = useState(false);
  const [shortCooldown, setShortCooldown] = useState(false);
  const [shortCooldownTimer, setShortCooldownTimer] = useState(0);
  const [cooldownExpiry, setCooldownExpiry] = useState<number | null>(null);
  const [rateLimitExpiry, setRateLimitExpiry] = useState<number | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isErrorButtonFromRateLimit, setIsErrorButtonFromRateLimit] =
    useState(false);
  const [countdownUpdate, setCountdownUpdate] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidMobile = (mobile: string) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const isValidUsername = (username: string) => {
    // Username can contain letters, numbers, hyphens, underscores, dots, and @ symbols
    return /^[a-zA-Z0-9@._-]{3,30}$/.test(username);
  };
  const getRegistrationCode = (formData) => {
    const config = schema.meta?.registrationCodeConfig || {
      name: schema.meta?.registrationCodeConfig,
    };
    const isShikshalokam = schema.meta?.isShikshalokam;
    // const isShikshalokam = true;
    const field = formData[config.name];
    formData['registration_code'] = formData[config.name];
    if (isShikshalokam) {
      formData.registration_code = formData['Registration Code'];
      formData['Registration Code'] = formData.registration_code;
      formData.registration_code = {
        externalId: formData['Registration Code'],
      };

      if (!formData.registration_code) {
        throw new Error('Registration code is required for shikshalokam');
      }
      return formData.registration_code;
    } else {
      const regConfig = schema.meta?.registrationCodeConfig;

      if (!regConfig?.name) {
        throw new Error('Registration code configuration is invalid');
      }

      const fieldValue = formData[regConfig.name];
      const valueKey = regConfig.value_ref || 'externalId';

      if (typeof fieldValue === 'object') {
        return fieldValue[valueKey];
      }
      return fieldValue;
    }
    // if (!field) return '';

    // // Get the value reference (default to 'externalId' if not specified)
    // const valueKey = config.value_ref || 'externalId';

    // // Handle both object and string values
    // if (typeof field === 'object') {
    //   return field[valueKey] || '';
    // }
    // return field;
  };
  const checkOtpAttempts = () => {
    const now = Date.now();
    const cooldownPeriod = 2 * 60 * 1000; // 2 minutes in milliseconds

    // Reset attempts if more than 2 minutes have passed since last attempt
    if (rateLimitExpiry && now > rateLimitExpiry) {
      setOtpAttempts(0);
      setRateLimitExpiry(null);
      setTooManyRequests(false);
      setIsRateLimited(false);
      setOtpDisabled(false);
      setOtpDisabledMessage('');
      // Reset errorButton only if it was set due to rate limiting
      if (isErrorButtonFromRateLimit) {
        setErrorButton(false);
        setIsErrorButtonFromRateLimit(false);
      }
      return true;
    }

    // Check if user has exceeded attempts
    if (otpAttempts >= 3) {
      setTooManyRequests(true);
      setIsRateLimited(true);
      setRateLimitExpiry(now + cooldownPeriod);
      return false;
    }

    return true;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (rateLimitExpiry && Date.now() > rateLimitExpiry) {
        setOtpAttempts(0);
        setRateLimitExpiry(null);
        setTooManyRequests(false);
        setIsRateLimited(false);
        setOtpDisabled(false);
        setOtpDisabledMessage('');
        // Reset errorButton only if it was set due to rate limiting
        if (isErrorButtonFromRateLimit) {
          setErrorButton(false);
          setIsErrorButtonFromRateLimit(false);
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(timer);
  }, [rateLimitExpiry, isErrorButtonFromRateLimit]);

  // Update countdown every second when rate limiting is active
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRateLimited && rateLimitExpiry) {
      // Initial update
      setCurrentTime(Date.now());

      timer = setInterval(() => {
        const now = Date.now();
        if (now >= rateLimitExpiry) {
          clearInterval(timer);
          setIsRateLimited(false);
          setRateLimitExpiry(null);
          setTooManyRequests(false);
          setOtpDisabled(false);
          setOtpDisabledMessage('');
          if (isErrorButtonFromRateLimit) {
            setErrorButton(false);
            setIsErrorButtonFromRateLimit(false);
          }
        } else {
          setCurrentTime(now);
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRateLimited, rateLimitExpiry, isErrorButtonFromRateLimit]);
  //custom validation on formData for learner fields hide on dob
  useEffect(() => {
    // Remove this line that was clearing error state on every formData change
    // setErrorButton(false);

    if (formData?.dob) {
      let age = calculateAgeFromDate(formData?.dob);
      let oldFormSchema = formSchema;
      let oldFormUiSchema = formUiSchema;
      let requiredArray = oldFormSchema?.required;
      let requiredKeys = ['parent_phone', 'guardian_relation', 'guardian_name'];

      //if learner form then only apply
      if (oldFormSchema?.properties?.guardian_relation) {
        if (age < 18) {
          // Merge only missing items from required2 into required1
          requiredKeys.forEach((item) => {
            if (!requiredArray.includes(item)) {
              requiredArray.push(item);
            }
          });
          //set ui schema show
          const updatedUiSchema = { ...oldFormUiSchema };
          // Clone each key's config and set widget to 'hidden'
          requiredKeys.forEach((key) => {
            if (updatedUiSchema.hasOwnProperty(key)) {
              updatedUiSchema[key] = {
                ...updatedUiSchema[key],
                'ui:widget': 'CustomTextFieldWidget',
              };
            }
          });
          oldFormUiSchema = updatedUiSchema;
        } else {
          // remove from required
          requiredArray = requiredArray.filter(
            (key) => !requiredKeys.includes(key)
          );
          //set ui schema hide
          const updatedUiSchema = { ...oldFormUiSchema };
          // Clone each key's config and set widget to 'hidden'
          requiredKeys.forEach((key) => {
            if (updatedUiSchema.hasOwnProperty(key)) {
              updatedUiSchema[key] = {
                ...updatedUiSchema[key],
                'ui:widget': 'hidden',
              };
            }
          });
          oldFormUiSchema = updatedUiSchema;
        }
        oldFormSchema.required = requiredArray;
        setFormSchema(oldFormSchema);
        setFormUiSchema(oldFormUiSchema);
      }
    }
    if (formData?.Role !== '') {
      const updatedFormSchema = {
        ...formSchema,
        required: formSchema.required?.filter((key) => key !== 'Role'),
      };

      const updatedFormUiSchema = {
        ...formUiSchema,
        subRoles: {
          ...formUiSchema.subRoles,
          'ui:widget': 'CustomSingleSelectWidget',
        },
      };

      setFormSchema(updatedFormSchema);
      setFormUiSchema(updatedFormUiSchema);
    } else {
      const updatedFormSchema = {
        ...formSchema,
        required: formSchema.required?.filter((key) => key !== 'role'),
      };

      const updatedFormUiSchema = {
        ...formUiSchema,
        subRoles: {
          ...formUiSchema.subRoles,
          'ui:widget': 'hidden',
        },
      };

      setFormSchema(updatedFormSchema);
      setFormUiSchema(updatedFormUiSchema);
    }

    if (formData?.udise === '' || formData?.Udise === '') {
      setFieldErrors((prev) => ({
        ...prev,
        udise: true,
        Udise: true,
      }));
      setFormErrors((prev) => ({
        ...prev,
        udise: ['UDISE code is required'],
        Udise: ['UDISE code is required'],
      }));
    } else if (formData?.udise || formData?.Udise) {
      setFieldErrors((prev) => ({
        ...prev,
        udise: false,
        Udise: false,
      }));
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.udise;
        delete newErrors.Udise;
        return newErrors;
      });
    }
    // if (formData?.email && formUiSchema?.mobile) {
    //   setFormUiSchema((prev) => ({
    //     ...prev,
    //     mobile: {
    //       ...prev.mobile,
    //       'ui:widget': 'hidden',
    //     },
    //   }));
    // } else if (formData?.mobile && formUiSchema?.email) {
    //   setFormUiSchema((prev) => ({
    //     ...prev,
    //     email: {
    //       ...prev.email,
    //       'ui:widget': 'hidden',
    //     },
    //   }));
    // }
  }, [formData]);
  const handleFieldError = (fieldName: string, hasError: boolean) => {
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: hasError,
    }));
  };

  const hasFormErrors = Object.values(fieldErrors).some(Boolean);

  useEffect(() => {
    if (isInitialCompleted === true) {
      // setFormData;
      renderPrefilledForm();
    }
  }, [isInitialCompleted]);

  useEffect(() => {
    if (isCallSubmitInHandle) {
      SubmitaFunction(formData);
    }
  }, [formData]);

  useEffect(() => {
    if (isRenderCompleted === true) {
      // handleChange({ formData: prefilledFormData });
    }
  }, [isRenderCompleted]);

  useEffect(() => {
    function extractSkipAndHide(schema: any): Record<string, any> {
      const skipAndHideMap: Record<string, any> = {};

      Object.entries(schema.properties).forEach(
        ([key, value]: [string, any]) => {
          if (value.extra?.skipAndHide) {
            skipAndHideMap[key] = value.extra.skipAndHide;
          }
        }
      );

      return skipAndHideMap;
    }
    const extractedSkipAndHide = extractSkipAndHide(schema);
    setHideAndSkipFields(extractedSkipAndHide);
  }, [schema]);

  const prevFormData = useRef({});

  useEffect(() => {
    const fetchApiData = async (schema) => {
      const initialApis = extractApiProperties(schema, 'initial');
      const dependentApis = extractApiProperties(schema, 'dependent');
      setDependentSchema(dependentApis);
      // // console.log('!!!', initialApis);
      try {
        const apiRequests = initialApis.map((field) => {
          const { api } = field;
          // If header exists, replace values with localStorage values
          let customHeader = api?.header
            ? {
                tenantId:
                  api.header.tenantId === '**'
                    ? localStorage.getItem('tenantId') ||
                      localStorage.getItem('tenantCode') ||
                      ''
                    : api.header.tenantId,
                Authorization:
                  api.header.Authorization === '**'
                    ? `Bearer ${localStorage.getItem('token') || ''}`
                    : api.header.Authorization,
                academicyearid:
                  api.header.academicyearid === '**'
                    ? localStorage.getItem('academicYearId') || ''
                    : api.header.academicyearid,
              }
            : {};
          const config = {
            method: api.method,
            url: api.url,
            headers: { 'Content-Type': 'application/json', ...customHeader },
            ...(api.method === 'POST' && { data: api.payload }),
          };
          return axios(config)
            .then((response) => ({
              fieldKey: field.key,
              data: getNestedValue(response.data, api.options.optionObj),
            }))
            .catch((error) => ({
              error: error,
              fieldKey: field.key,
            }));
        });

        const responses = await Promise.all(apiRequests);

        // Update schema dynamically
        if (!responses[0]?.error) {
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            responses.forEach(({ fieldKey, data }) => {
              let label = prevSchema.properties[fieldKey].api.options.label;
              let value = prevSchema.properties[fieldKey].api.options.value;
              if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  items: {
                    type: 'string',
                    enum: data
                      ? data?.map((item) => item?.[value].toString())
                      : ['Select'],
                    enumNames: data
                      ? data?.map((item) =>
                          transformLabel(item?.[label].toString())
                        )
                      : ['Select'],
                  },
                };
              } else {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  enum: data
                    ? data?.map((item) => item?.[value].toString())
                    : ['Select'],
                  enumNames: data
                    ? data?.map((item) =>
                        transformLabel(item?.[label].toString())
                      )
                    : ['Select'],
                };
              }
            });
            return { ...prevSchema, properties: updatedProperties };
          });
        } else {
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            let fieldKey = responses[0]?.fieldKey;
            if (updatedProperties[fieldKey]?.isMultiSelect === true) {
              updatedProperties[fieldKey] = {
                ...updatedProperties[fieldKey],
                items: {
                  type: 'string',
                  enum: ['Select'],
                  enumNames: ['Select'],
                },
              };
            } else {
              updatedProperties[fieldKey] = {
                ...updatedProperties[fieldKey],
                enum: ['Select'],
                enumNames: ['Select'],
              };
            }
            return { ...prevSchema, properties: updatedProperties };
          });
        }

        setIsInitialCompleted(true);
      } catch (error) {
        // console.error("Error fetching API data:", error);
      }
    };

    const getNestedValue = (obj, path) => {
      if (path === '') {
        return obj;
      } else {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
      }
    };

    // Call the function
    fetchApiData(schema);

    //replace title with language constant
    const updateSchemaTitles = (schema, t) => {
      if (!schema || typeof schema !== 'object') return schema;

      const updatedSchema = { ...schema };

      if (updatedSchema.title) {
        updatedSchema.title = t(updatedSchema.title);
      }

      if (updatedSchema.properties) {
        updatedSchema.properties = Object.keys(updatedSchema.properties).reduce(
          (acc, key) => {
            acc[key] = updateSchemaTitles(updatedSchema.properties[key], t);
            return acc;
          },
          {}
        );
      }

      return updatedSchema;
    };
    // Dynamically update schema titles
    // const translatedSchema = updateSchemaTitles(formSchema, t);
    // setFormSchema(translatedSchema);
  }, []);

  // console.log('schema', schema)
  const extractApiProperties = (schema, callType) => {
    return Object.entries(schema.properties)
      .filter(([_, value]) => value.api && value.api.callType === callType)
      .map(([key, value]) => ({ key, ...value }));
  };

  const renderPrefilledForm = () => {
    const temp_prefilled_form = { ...prefilledFormData };
    const dependentApis = extractApiProperties(schema, 'dependent');
    const initialApis = extractApiProperties(schema, 'initial');

    if (dependentApis.length > 0 && initialApis.length > 0) {
      let initialKeys = initialApis.map((item) => item.key);
      let dependentKeys = dependentApis.map((item) => item.key);
      dependentKeys = [...initialKeys, ...dependentKeys];

      const removeDependentKeys = (formData, keysToRemove) => {
        const updatedData = { ...formData };
        keysToRemove.forEach((key) => delete updatedData[key]);
        return updatedData;
      };
      let updatedFormData = removeDependentKeys(
        temp_prefilled_form,
        dependentKeys
      );
      setFormData(updatedFormData);

      //prefill other dependent keys
      const filterDependentKeys = (
        formData: Record<string, any>,
        keysToKeep: string[]
      ) => {
        return Object.fromEntries(
          Object.entries(formData).filter(([key]) => keysToKeep.includes(key))
        );
      };
      let filteredFormData = filterDependentKeys(
        temp_prefilled_form,
        dependentKeys
      );
      const filteredFormDataKey = Object.keys(filteredFormData);
      let filterDependentApis = [];
      for (let i = 0; i < filteredFormDataKey.length; i++) {
        filterDependentApis.push({
          key: filteredFormDataKey[i],
          data: schema.properties[filteredFormDataKey[i]],
        });
      }
      //dependent calls
      const workingSchema = filterDependentApis;

      const getNestedValue = (obj, path) => {
        if (path === '') {
          return obj;
        } else {
          return path.split('.').reduce((acc, key) => acc && acc[key], obj);
        }
      };

      const fetchDependentApis = async () => {
        // Filter only the dependent APIs based on the changed field
        const dependentApis = workingSchema;
        try {
          const apiRequests = dependentApis.map((realField) => {
            const field = realField?.data;
            const { api } = realField?.data;
            const key = realField?.key;

            const changedField = field?.api?.dependent;
            const changedFieldValue = temp_prefilled_form[changedField];
            let isMultiSelect = field?.isMultiSelect;
            let updatedPayload = replaceControllingField(
              api.payload,
              changedFieldValue,
              isMultiSelect
            );

            let customHeader = api?.header
              ? {
                  tenantId:
                    api.header.tenantId === '**'
                      ? localStorage.getItem('tenantId') ||
                        localStorage.getItem('tenantCode') ||
                        ''
                      : api.header.tenantId,
                  Authorization:
                    api.header.Authorization === '**'
                      ? `Bearer ${localStorage.getItem('token') || ''}`
                      : api.header.Authorization,
                  academicyearid:
                    api.header.academicyearid === '**'
                      ? localStorage.getItem('academicYearId') || ''
                      : api.header.academicyearid,
                }
              : {};
            const config = {
              method: api.method,
              url: api.url,
              headers: { 'Content-Type': 'application/json', ...customHeader },
              ...(api.method === 'POST' && { data: updatedPayload }),
            };
            if (key) {
              const changedField = key;

              const workingSchema1 = dependentSchema?.filter(
                (item) => item.api && item.api.dependent === changedField
              );
              if (workingSchema1.length > 0) {
                const changedFieldValue = temp_prefilled_form[changedField];

                const getNestedValue = (obj, path) => {
                  if (path === '') {
                    return obj;
                  } else {
                    return path
                      .split('.')
                      .reduce((acc, key) => acc && acc[key], obj);
                  }
                };

                const fetchDependentApis = async () => {
                  // Filter only the dependent APIs based on the changed field
                  const dependentApis = workingSchema1;
                  try {
                    const apiRequests = dependentApis.map((field) => {
                      const { api, key } = field;

                      let isMultiSelect = field?.isMultiSelect;
                      let updatedPayload = replaceControllingField(
                        api.payload,
                        changedFieldValue,
                        isMultiSelect
                      );

                      // If header exists, replace values with localStorage values
                      let customHeader = api?.header
                        ? {
                            tenantId:
                              api.header.tenantId === '**'
                                ? localStorage.getItem('tenantId') ||
                                  localStorage.getItem('tenantCode') ||
                                  ''
                                : api.header.tenantId,
                            Authorization:
                              api.header.Authorization === '**'
                                ? `Bearer ${
                                    localStorage.getItem('token') || ''
                                  }`
                                : api.header.Authorization,
                            academicyearid:
                              api.header.academicyearid === '**'
                                ? localStorage.getItem('academicYearId') || ''
                                : api.header.academicyearid,
                          }
                        : {};
                      const config = {
                        method: api.method,
                        url: api.url,
                        headers: {
                          'Content-Type': 'application/json',
                          ...customHeader,
                        },
                        ...(api.method === 'POST' && { data: updatedPayload }),
                      };
                      return axios(config)
                        .then((response) => ({
                          fieldKey: field.key,
                          data: getNestedValue(
                            response.data,
                            api.options.optionObj
                          ),
                        }))
                        .catch((error) => ({
                          error: error,
                          fieldKey: field.key,
                        }));
                    });

                    const responses = await Promise.all(apiRequests);
                    if (!responses[0]?.error) {
                      setFormSchema((prevSchema) => {
                        const updatedProperties = { ...prevSchema.properties };
                        responses.forEach(({ fieldKey, data }) => {
                          let label =
                            prevSchema.properties[fieldKey].api.options.label;
                          let value =
                            prevSchema.properties[fieldKey].api.options.value;
                          if (
                            updatedProperties[fieldKey]?.isMultiSelect === true
                          ) {
                            updatedProperties[fieldKey] = {
                              ...updatedProperties[fieldKey],
                              items: {
                                type: 'string',
                                enum: data?.map((item) =>
                                  item?.[value].toString()
                                ),
                                enumNames: data?.map((item) =>
                                  transformLabel(item?.[label].toString())
                                ),
                              },
                            };
                          } else {
                            updatedProperties[fieldKey] = {
                              ...updatedProperties[fieldKey],
                              enum: data?.map((item) =>
                                item?.[value].toString()
                              ),
                              enumNames: data?.map((item) =>
                                transformLabel(item?.[label].toString())
                              ),
                            };
                          }
                        });

                        return { ...prevSchema, properties: updatedProperties };
                      });
                    } else {
                      setFormSchema((prevSchema) => {
                        const updatedProperties = { ...prevSchema.properties };
                        let fieldKey = responses[0]?.fieldKey;
                        if (
                          updatedProperties[fieldKey]?.isMultiSelect === true
                        ) {
                          updatedProperties[fieldKey] = {
                            ...updatedProperties[fieldKey],
                            items: {
                              type: 'string',
                              enum: ['Select'],
                              enumNames: ['Select'],
                            },
                          };
                        } else {
                          updatedProperties[fieldKey] = {
                            ...updatedProperties[fieldKey],
                            enum: ['Select'],
                            enumNames: ['Select'],
                          };
                        }
                        return { ...prevSchema, properties: updatedProperties };
                      });
                    }
                  } catch (error) {
                    console.error('Error fetching dependent APIs:', error);
                  }
                };

                // Call the function
                fetchDependentApis();
              }
            }

            return axios(config).then((response) => ({
              fieldKey: key,
              data: getNestedValue(response.data, api.options.optionObj),
            }));
          });

          const responses = await Promise.all(apiRequests);
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            responses.forEach(({ fieldKey, data }) => {
              let label = prevSchema.properties[fieldKey].api.options.label;
              let value = prevSchema.properties[fieldKey].api.options.value;
              if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  items: {
                    type: 'string',
                    enum: data?.map((item) => item?.[value].toString()),
                    enumNames: data?.map((item) =>
                      transformLabel(item?.[label].toString())
                    ),
                  },
                };
              } else {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  enum: data?.map((item) => item?.[value].toString()),
                  enumNames: data?.map((item) =>
                    transformLabel(item?.[label].toString())
                  ),
                };
              }
            });

            return { ...prevSchema, properties: updatedProperties };
          });
        } catch (error) {
          console.error('Error fetching dependent APIs:', error);
        }
      };

      // Call the function
      fetchDependentApis();

      //setFormData
      setFormData(temp_prefilled_form);

      function getSkipKeys(skipHideObject, formData) {
        let skipKeys = [];

        Object.keys(skipHideObject).forEach((key) => {
          if (formData[key] && skipHideObject[key][formData[key]]) {
            skipKeys = skipKeys.concat(skipHideObject[key][formData[key]]);
          }
        });

        return skipKeys;
      }

      const skipKeys = getSkipKeys(hideAndSkipFields, temp_prefilled_form);
      let updatedUISchema = formUiSchemaOriginal;
      function hideFieldsInUISchema(uiSchema, fieldsToHide) {
        const updatedUISchema = { ...uiSchema };

        fieldsToHide.forEach((field) => {
          if (updatedUISchema[field]) {
            updatedUISchema[field] = {
              ...updatedUISchema[field],
              originalWidget: updatedUISchema[field]['ui:widget'], // Store original widget type
              'ui:widget': 'hidden',
            };
          }
        });

        return updatedUISchema;
      }
      const hiddenUISchema = hideFieldsInUISchema(updatedUISchema, skipKeys);
      setFormUiSchema(hiddenUISchema);
    }
    //Code patch: bug solved for prefilled dependent field options render
    setIsRenderCompleted(true);
  };

  const getDependentKeys = (schema, startKey) => {
    const properties = schema.properties;
    const dependentKeys = [];

    const findDependencies = (key) => {
      Object.keys(properties).forEach((propKey) => {
        const field = properties[propKey];
        if (field.api && field.api.dependent === key) {
          dependentKeys.push(propKey);
          findDependencies(propKey); // Recursively check deeper dependencies
        }
      });
    };

    findDependencies(startKey);
    return dependentKeys;
  };

  const hasObjectChanged = (oldObj, newObj) => {
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (let key of keys) {
      const oldValue = oldObj[key] || [];
      const newValue = newObj[key] || [];

      // Handle array comparison
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (oldValue.length !== newValue.length) return true;
        const isDifferent = oldValue.some(
          (val, index) => val !== newValue[index]
        );
        if (isDifferent) return true;
      }
      // Handle normal value comparison
      else if (oldValue !== newValue) {
        return true;
      }
    }

    return false;
  };

  const replaceControllingField = (
    payload,
    changedFieldValue,
    isMultiSelect
  ) => {
    // Deep clone to avoid modifying the original object
    const updatedPayload = JSON.parse(JSON.stringify(payload));
    // Determine new value based on type
    const newValue = isMultiSelect
      ? Array.isArray(changedFieldValue)
        ? [...changedFieldValue]
        : [changedFieldValue]
      : changedFieldValue;

    // Recursive function to replace ** in nested objects/arrays
    const replaceNested = (obj) => {
      if (Array.isArray(obj)) {
        // If array, iterate through each element
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            replaceNested(item); // Recursive call for nested objects/arrays
          } else if (item === '**') {
            obj[index] = newValue;
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        // If object, iterate through keys
        Object.keys(obj).forEach((key) => {
          if (obj[key] === '**') {
            obj[key] = newValue;
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            replaceNested(obj[key]); // Recursive call for nested objects/arrays
          }
        });
      }
    };

    // Start recursion from the root
    replaceNested(updatedPayload);

    return updatedPayload;
  };
  const getChangedField = (
    formData: Record<string, any>,
    prevFormData: Record<string, any>
  ) => {
    return Object.keys(formData).find((key) => {
      const newValue = formData[key];
      const oldValue = prevFormData[key];

      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        // Check if arrays have different elements (added/removed values)
        return (
          newValue.length !== oldValue.length ||
          !newValue.every((val) => oldValue.includes(val))
        );
      } else {
        // Check for primitive value changes
        return newValue !== oldValue;
      }
    });
  };
  useEffect(() => {
    if (formData.email || formData.mobile) {
      setShowEmailMobileError('');
    }
  }, [formData.email, formData.mobile]);

  const checkUsernameAvailability = useCallback(
    _.debounce(async (username) => {
      if (!username) {
        setUsernameError('');
        setIsUsernameValid(false);
        return;
      }
      setIsUsernameValid(false);
      try {
        const response = await axios.get(
          `${API_ENDPOINTS.checkUser(username)}`,
          {
            headers: {
              Origin: 'localhost',
            },
          }
        );

        if (response?.data?.message === 'Username is already taken') {
          setErrorMessage(response?.data?.message);
          setShowError(true);
          setErrorButton(true);
          setAlertSeverity('error');
          setIsUsernameValid(false);
          setTimeout(() => {
            setShowError(false);
          }, 8000);
        } else {
          setErrorMessage('');
          setErrorButton(false);
          setShowError(false);

          setIsUsernameValid(true);
        }
      } catch (error) {
        setUsernameError('Error checking username availability');
        setIsUsernameValid(false);
      }
    }, 500),
    []
  );

  const handleChange = useCallback(
    async ({ formData, errors }: { formData: any; errors: any }) => {
      const newErrors: Record<string, string[]> = {};
      Object.keys(errors).forEach((key) => {
        if (errors[key].__errors && errors[key].__errors.length > 0) {
          newErrors[key] = errors[key].__errors;
        }
      });
      setFormErrors(newErrors);

      const prevRole = prevFormData.current?.Role;
      const currentRole = formData?.Role;
      const prevUdise =
        prevFormData.current?.udise || prevFormData.current?.Udise;
      const currentUdise = formData?.Udise;
      // Create a new form data object
      let newFormData = { ...formData };
      if (currentUdise === undefined) {
        formData.Udise = '';
        formData.udise = '';
        formData.State = { _id: '', name: '', externalId: '' };
        formData.District = { _id: '', name: '', externalId: '' };
        formData.Block = { _id: '', name: '', externalId: '' };
        formData.Cluster = { _id: '', name: '', externalId: '' };
        formData.School = { _id: '', name: '', externalId: '' };
        newFormData = {
          ...newFormData,
          Udise: '',
          udise: '',
          State: '',
          District: '',
          Block: '',
          Cluster: '',
          School: '',
        };
      }
      // Check if role changed and clear sub-roles if it did
      if (currentRole && currentRole !== prevRole) {
        newFormData = {
          ...newFormData,
          'Sub-Role': undefined,
        };
        setSubroles([]);
        // Don't call setFormData here, let it be called once at the end
        setFormUiSchema((prev) => ({
          ...prev,
          'Sub-Role': {
            ...prev['Sub-Role'],
            'ui:widget': 'hidden',
          },
        }));
      }

      // Only autofill email/mobile if username changed
      const usernameChanged =
        formData.Username !== prevFormData.current?.Username;

      if (usernameChanged) {
        if (isValidMobile(formData.Username)) {
          newFormData = {
            ...newFormData,
            mobile: formData.Username,
          };
          setShowEmailMobileError(
            "Email is optional since you've provided a mobile number"
          );
        } else if (isValidEmail(formData.Username)) {
          newFormData = {
            ...newFormData,
            email: formData.Username,
          };
          setShowEmailMobileError(
            "Mobile is optional since you've provided an email"
          );
        } else if (isValidUsername(formData.Username)) {
          // Username is valid format, no need to auto-fill email/mobile
          setShowEmailMobileError('');
        } else {
          setShowEmailMobileError(
            'Username must be either a valid email or 10-digit mobile number'
          );
        }
      }
      setIsUsernameValid(false);
      // Check username availability if username changed
      if (formData.Username) {
        checkUsernameAvailability(formData.Username);
      }

      // Handle email/mobile validation
      if (newFormData.email && newFormData.mobile) {
        setShowEmailMobileError('');
      } else if (newFormData.email) {
        setShowEmailMobileError(
          "Contact number is optional since you've provided an email"
        );
      } else if (newFormData.mobile) {
        setShowEmailMobileError(
          "Email is optional since you've provided a Contact number"
        );
      } else {
        setShowEmailMobileError('');
      }

      // Update form data only once at the end
      setFormData(newFormData);
      prevFormData.current = newFormData;

      // Call the onChange prop if it exists
      if (onChange) {
        onChange({ formData: newFormData, errors });
      }
    },
    [onChange, checkUsernameAvailability]
  );

  const handleSubmit = ({ formData }: { formData: any }) => {
    //step-1 : Check and remove skipped Data
    function filterFormData(skipHideObject, formData) {
      const updatedFormData = { ...formData };

      Object.keys(skipHideObject).forEach((key) => {
        if (formData[key] && skipHideObject[key][formData[key]]) {
          skipHideObject[key][formData[key]].forEach((fieldToRemove) => {
            delete updatedFormData[fieldToRemove];
          });
        }
      });

      return updatedFormData;
    }
    const filteredData = filterFormData(hideAndSkipFields, formData);
    const cleanedData = Object.fromEntries(
      Object.entries(filteredData).filter(
        ([_, value]) => !Array.isArray(value) || value.length > 0
      )
    );
    //step-2 : Validate the form data
    function transformFormData(
      formData: Record<string, any>,
      schema: any,
      extraFields: Record<string, any> = {} // Optional root-level custom fields
    ) {
      const transformedData: Record<string, any> = {
        ...extraFields, // Add optional root-level custom fields dynamically
        customFields: [],
      };

      for (const key in formData) {
        if (schema.properties[key]) {
          const fieldSchema = schema.properties[key];

          if (fieldSchema.coreField === 0 && fieldSchema.fieldId) {
            // Use fieldId for custom fields
            transformedData.customFields.push({
              fieldId: fieldSchema.fieldId,
              value: formData[key] || '',
            });
          } else {
            // Use the field name for core fields
            transformedData[key] = formData[key] || '';
          }
        }
      }

      return transformedData;
    }

    // Optional extra root-level fields
    // Extra Field for cohort creation

    const transformedFormData = transformFormData(
      cleanedData,
      schema,
      extraFields
    );

    //add name in always lower case
    if (transformedFormData?.name) {
      transformedFormData.name = transformedFormData.name.toLowerCase();
    }

    if (!isCallSubmitInHandle) {
      FormSubmitFunction(cleanedData, transformedFormData);
    }

    //live validate error fix
    setSubmitted(true);
    // Get first error field and scroll into view
    setTimeout(() => {
      const errorField = document.querySelector('.field-error');
      if (errorField) {
        errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  // console.log(formSchema);

  // Regex to Error Mapping
  const patternErrorMessages = {
    '^(?=.*[a-zA-Z])[a-zA-Z ]+$':
      'Numbers and special characters are not allowed',
    '^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$':
      'Numbers and special characters are not allowed',
    '^[a-zA-Z0-9.@]+$': 'Space and special characters are not allowed',
    '^[0-9]{10}$': 'Enter a valid Mobile Number',
    '^d{10}$': 'Characters and special characters are not allowed',
  };

  // Dynamic custom validation
  const customValidate = (formData, errors) => {
    Object.keys(formSchema.properties).forEach((key) => {
      const field = formSchema.properties[key];
      const value = formData[key];
      // Ensure errors[key] is defined
      if (!errors[key]) {
        errors[key] = {};
      }

      // ✅ Clear error if field is empty or invalid
      if (!value || value === '' || value === null || value === undefined) {
        if (errors[key]?.__errors) {
          errors[key].__errors = []; // ✅ Clear existing errors
        }
        delete errors[key]; // ✅ Completely remove errors if empty
      } else if (field.pattern) {
        // ✅ Validate pattern only if the field has a value
        const patternRegex = new RegExp(field.pattern);
        if (!patternRegex.test(value)) {
          const errorMessage =
            patternErrorMessages?.[field.pattern] ||
            `Invalid format for ${field.title || key}.`;

          // ✅ Add only if pattern does not match
          if (!errors[key].__errors) {
            errors[key].__errors = [];
          }
          errors[key].__errors = [errorMessage];
        } else {
          // ✅ Clear errors if pattern matches
          if (errors[key]?.__errors) {
            errors[key].__errors = [];
          }
          delete errors[key]; // ✅ Remove errors if valid
        }
      }
    });

    return errors;
  };

  const transformErrors = (errors) => {
    let updatedError = errors;

    if (!submitted) {
      return [];
    }

    return updatedError;
  };
  useEffect(() => {
    if (!formData.Role) {
      setSubroles([]);
      // Also clear any selected subroles
      setFormData((prev) => ({ ...prev, 'Sub-Role': [] }));
    }
  }, [formData.Role]);
  useEffect(() => {
    setFormSchema((prevSchema) => {
      const updatedProperties = { ...prevSchema.properties };

      if (updatedProperties.email) {
        updatedProperties.email.readOnly = false;
        updatedProperties.email.required = false;
      }

      if (updatedProperties.mobile) {
        updatedProperties.mobile.readOnly = false;
        updatedProperties.mobile.required = false;
      }

      return { ...prevSchema, properties: updatedProperties };
    });

    setFormUiSchema((prevUiSchema) => {
      const updatedUiSchema = { ...prevUiSchema };

      if (updatedUiSchema.email) {
        updatedUiSchema.email['ui:disabled'] = false;
        updatedUiSchema.email['ui:readonly'] = false;
      }

      if (updatedUiSchema.mobile) {
        updatedUiSchema.mobile['ui:disabled'] = false;
        updatedUiSchema.mobile['ui:readonly'] = false;
      }

      return updatedUiSchema;
    });
  }, []);
  const handleFetchData = React.useCallback((response: any) => {
    // Example: Update specific fields from API response

    setFormData((prev) => ({
      ...prev,
      State: response.state ?? { _id: '', name: '', externalId: '' },
      District: response.district ?? { _id: '', name: '', externalId: '' },
      Block: response.block ?? { _id: '', name: '', externalId: '' },
      Cluster: response.cluster ?? { _id: '', name: '', externalId: '' },
      School: response.School ?? { _id: '', name: '', externalId: '' }, // Note the capitalization here
      udise: response.udise ?? '',
    }));
  }, []);
  const MemoizedUdiaseWithButton = React.memo(({ onFetchData, ...props }) => (
    <UdiaseWithButton {...props} onFetchData={onFetchData} />
  ));
  const subrolesRef = useRef<any[]>([]);

  // Update ref whenever subroles change
  useEffect(() => {
    subrolesRef.current = subroles;
  }, [subroles]);

  const widgets = React.useMemo(
    () => ({
      CustomMultiSelectWidget: (props) => (
        <CustomMultiSelectWidget
          {...props}
          options={{
            ...props.options,
            enumOptions: subrolesRef.current,
          }}
        />
      ),
      CustomSingleSelectWidget: (props) => (
        <CustomSingleSelectWidget
          {...props}
          onSubrolesChange={(newSubroles) => {
            setSubroles(newSubroles);
            // Force update the form schema
            setFormUiSchema((prev) => ({
              ...prev,
              'Sub-Role': {
                ...prev['Sub-Role'],
                'ui:options': {
                  ...prev['Sub-Role']?.['ui:options'],
                  enumOptions: newSubroles,
                },
                'ui:widget': newSubroles?.length //
                  ? 'CustomMultiSelectWidget'
                  : 'hidden',
              },
            }));
          }}
        />
      ),
      CustomTextFieldWidget: (props) => (
        <CustomTextFieldWidget
          {...props}
          onErrorChange={(hasError) => {
            handleFieldError(props.id, hasError);
          }}
          onClearError={(fieldName) => {
            // Clear error for the other field when one is filled
            setFieldErrors((prev) => ({ ...prev, [fieldName]: false }));
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[fieldName];
              return newErrors;
            });
          }}
        />
      ),
      CustomCheckboxWidget,
      CustomDateWidget,
      SearchTextFieldWidget,
      CustomRadioWidget,
      // CustomTextFieldWidget,
      UdiaseWithButton: (props) => (
        <MemoizedUdiaseWithButton {...props} onFetchData={handleFetchData} />
      ),
      CustomEmailWidget,
    }),
    [handleFetchData, isRateLimited, rateLimitExpiry, countdownUpdate] // Removed subroles from dependency
  );
  const validateForm = () => {
    const isValid = !!(formData.email || formData.mobile);
    setShowEmailMobileError(!isValid);
    return isValid;
  };
  const handleSendOtp = async () => {
    if (!checkOtpAttempts()) {
      return;
    }
    setErrorButton(false);
    const customFields = Object.entries(fieldIdMapping).flatMap(
      ([name, fieldId]) => {
        let fieldValue = formData[name] ?? '';

        // Skip subRoles if not present or empty
        if (name === 'subRoles') {
          if (
            !fieldValue ||
            (Array.isArray(fieldValue) && fieldValue.length === 0)
          ) {
            return []; // Skip this field
          }
          // Ensure it's an array
          fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          return [{ fieldId, value: fieldValue }];
        }

        // Ensure roles is an array
        if (name === 'roles') {
          fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          return [{ fieldId, value: fieldValue }];
        }

        // For other fields, stringify if object
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          return [
            {
              fieldId,
              value: JSON.stringify({
                id: fieldValue._id ?? fieldValue.id ?? '',
                name: fieldValue.name ?? '',
              }),
            },
          ];
        }

        // For primitives
        return [{ fieldId, value: fieldValue }];
      }
    );

    // const userName = formData.firstName;
    const registrationCode = getRegistrationCode(formData);

    let otpPayload;
    const hasMobile = !!formData.mobile?.trim(); // Checks if user entered any mobile number
    const isValidMobile = /^[6-9]\d{9}$/.test(formData.mobile?.trim() ?? '');

    otpPayload = {
      name: `${formData.firstName}${
        formData.lastName ? ` ${formData.lastName}` : ''
      }`,
      email: formData.email,
      ...(hasMobile && { phone: formData.mobile.trim() }),
      ...(hasMobile && { phone_code: '+91' }),
      password: formData.password,
      // registration_code: 'blr',
      registration_code: formData.registration_code.externalId, // Using default value as per your curl example
    };

    try {
      const registrationResponse = await sendOtp(otpPayload);
      setOtpAttempts((prev) => prev + 1);
      setLastOtpAttemptTime(Date.now());
      console.log('registrationResponse', registrationResponse.message);

      if (registrationResponse?.responseCode === 'OK') {
        setRequestData({
          usercreate: {
            request: {
              userName: formData.username,
            },
          },
        });
        // setErrorMessage(registrationResponse.message);
        // setAlertSeverity('success');
        setIsOpenOTP(true);
      } else {
        if (registrationResponse?.message === 'INVALID_ORG_registration_code') {
          setShowError(true);
          setErrorButton(true);
          setIsErrorButtonFromRateLimit(false);
          setAlertSeverity('error');
          setErrorMessage('Invalid Organisation');
          setTimeout(() => {
            setShowError(false);
          }, 8000);
        } else if (
          registrationResponse?.message ===
          'Too many requests. Please try again later.'
        ) {
          const now = Date.now();
          setTooManyRequests(true);
          setIsRateLimited(true);
          setRateLimitExpiry(now + 2 * 60 * 1000); // 2 minutes from now
          setCurrentTime(now); // Set initial current time
          setShowError(true);
          setErrorButton(true);
          setIsErrorButtonFromRateLimit(true);
          setAlertSeverity('error');
          setErrorMessage(registrationResponse.message);
          setTimeout(() => {
            setShowError(false);
          }, 8000);
          return;
        } else {
          setShowError(true);
          setErrorButton(true);
          setIsErrorButtonFromRateLimit(false);
          setAlertSeverity('error');
          setErrorMessage(registrationResponse.message);
          setTimeout(() => {
            setShowError(false);
          }, 8000);
        }
      }
    } catch (error) {
      // Update OTP attempt tracking even on failure
      setOtpAttempts((prev) => prev + 1);
      setLastOtpAttemptTime(Date.now());
      // ... existing error handling ...
    }
  };
  const handleRegister = async (otp) => {
    if (!formData.email && !formData.mobile) {
      setShowEmailMobileError(
        'Please provide either an email or a mobile number.'
      );
      return;
    }
    setIsOpenOTP(false);

    const getSubRoleExternalIds = () => {
      if (!formData['Sub-Role'] || formData['Sub-Role'].length === 0) return [];

      // Find matching subroles in your uiSchema options
      const subRoleOptions =
        uiSchema['Sub-Role']?.['ui:options']?.enumOptions ?? [];

      return formData['Sub-Role'].map((selectedId) => {
        const foundOption = subRoleOptions.find(
          (option) => option.value === selectedId
        );
        return foundOption?._originalData?._id ?? selectedId;
      });
    };
    // const userName = formData.firstName;
    const isMobile = /^[6-9]\d{9}$/.test(formData.mobile);
    const registrationCode = getRegistrationCode(formData);
    console.log('registrationCode create', registrationCode);
    const payload = {
      name:
        formData.firstName + (formData.lastName ? ` ${formData.lastName}` : ''),
      username: formData.Username,
      password: formData.password,
      email: formData.email,
      ...(isMobile && { phone: formData.mobile }),
      ...(isMobile && { phone_code: '+91' }),
      state: formData.State?._id ?? '',
      district: formData.District?._id ?? '',
      block: formData.Block?._id ?? '',
      cluster: formData.Cluster?._id ?? '',
      school: formData.School?._id ?? '',
      registration_code: formData.registration_code.externalId ?? '',
      professional_role: localStorage.getItem('role'),
      professional_subroles: getSubRoleExternalIds(),
      otp: Number(otp),
      // customFields,
    };

    setRegisterData(payload);

    const registrationResponse = await registerUserService(payload);
    if (registrationResponse?.responseCode === 'OK') {
      setRequestData({
        usercreate: {
          request: {
            userName: registrationResponse?.result?.user?.username,
          },
        },
      });
      setErrorMessage(registrationResponse.message);
      setAlertSeverity('success');
      const accessToken = registrationResponse?.result?.access_token;
      const refreshToken = registrationResponse?.result?.refresh_token;
      localStorage.setItem('accToken', accessToken);
      localStorage.setItem('refToken', refreshToken);
      localStorage.setItem(
        'firstname',
        registrationResponse?.result?.user?.name
      );
      localStorage.setItem('userId', registrationResponse?.result?.user?.id);
      localStorage.setItem(
        'name',
        registrationResponse?.result?.user?.username
      );
      router.push('/home');
      const organizations =
        registrationResponse?.result?.user?.organizations ?? [];
      const orgId = organizations[0]?.id;
      if (orgId) {
        localStorage.setItem(
          'headers',
          JSON.stringify({ 'org-id': orgId.toString() })
        );
      }
      // setDialogOpen(true);
    } else {
      setShowError(true);
      setAlertSeverity('error');
      setErrorButton(true);
      console.log('registrationResponse', registrationResponse);
      setErrorMessage(registrationResponse.data.message);
      setTimeout(() => {
        setShowError(false);
      }, 8000);
    }
  };

  const handleDialogClose = async () => {
    setDialogOpen(false);
    try {
      const response = await signin({
        username: formData.Username,
        password: formData.password,
      });

      if (response?.result?.access_token) {
        localStorage.setItem('accToken', response?.result?.access_token);
        localStorage.setItem('refToken', response?.result?.refresh_token);
        const tenantResponse = await authenticateLoginUser({
          token: response?.result?.access_token,
        });
        localStorage.setItem('firstname', tenantResponse?.result?.firstName);

        if (tenantResponse?.result?.status === 'archived') {
          setShowError(true);
          setErrorButton(true);
          setErrorMessage('The user is decativated please contact admin');
          setTimeout(() => {
            setShowError(false);
          }, 8000);
          return;
        } else {
          if (tenantResponse?.result?.tenantData?.[0]?.tenantId) {
            localStorage.setItem('userId', tenantResponse?.result?.userId);
            localStorage.setItem(
              'firstname',
              tenantResponse?.result?.firstName
            );
            localStorage.setItem('name', tenantResponse?.result?.username);
            const tenantIdToCompare =
              tenantResponse?.result?.tenantData?.[0]?.tenantId;
            if (tenantIdToCompare) {
              localStorage.setItem(
                'headers',
                JSON.stringify({
                  'org-id': tenantIdToCompare,
                })
              );
            }

            const tenantData = await fetchTenantData({
              token: response?.result?.access_token,
            });
            if (tenantIdToCompare) {
              const matchedTenant = tenantData?.result?.find(
                (tenant) => tenant.tenantId === tenantIdToCompare
              );
              localStorage.setItem('channelId', matchedTenant?.channelId);
              localStorage.setItem(
                'frameworkname',
                matchedTenant?.contentFramework
              );
              if (tenantIdToCompare === process.env.NEXT_PUBLIC_ORGID) {
                const redirectUrl = '/home';
                router.push(redirectUrl);
              } else {
                setShowError(true);
                setErrorButton(true);
                setErrorMessage(
                  'The user does not belong to the same organization.'
                );
                setTimeout(() => {
                  setShowError(false);
                }, 8000);
              }
            }
          }
        }

        // Check rootOrgId and route or show error
      } else {
        setShowError(true);
        setErrorButton(true);
        setErrorMessage('Login failed. Invalid Username or Password.');
        setTimeout(() => {
          setShowError(false);
        }, 8000);
      }
    } catch (error) {
      setShowError(true);
      setErrorButton(true);
      setErrorMessage(error?.message ?? 'Login failed. Please try again.');
      setTimeout(() => {
        setShowError(false);
      }, 8000);
    } finally {
      // setLoading(false);
    }
    // router.push('/');
    // localStorage.clear();
  };
  const hasValidationErrors = () => {
    const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
    const hasFormErrors = Object.keys(formErrors).length > 0;

    // Check if we have at least one valid contact method
    const hasValidContact =
      (formData.email && isValidEmail(formData.email)) ||
      (formData.mobile && isValidMobile(formData.mobile));

    // Check if username format is valid (if username is provided)
    const hasValidUsernameFormat = formData.Username
      ? isValidEmail(formData.Username) ||
        isValidMobile(formData.Username) ||
        isValidUsername(formData.Username)
      : true;

    return (
      hasFieldErrors ||
      hasFormErrors ||
      !hasValidContact ||
      (!isUsernameValid && formData.Username) ||
      !hasValidUsernameFormat
    );
  };

  return (
    <>
      {errorMessage && showError && (
        <Box sx={{ my: 2 }}>
          <Alert severity={alertSeverity} onClose={() => setShowError(false)}>
            {errorMessage}
          </Alert>
        </Box>
      )}
      {!isCallSubmitInHandle ? (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>

          <Form
            ref={formRef}
            schema={formSchema}
            uiSchema={formUiSchema}
            formData={formData}
            formContext={{ formData }}
            onChange={handleChange}
            onSubmit={({ formData }) => {
              handleSubmit({ formData });
            }}
            validator={validator}
            showErrorList={false}
            liveValidate
            transformErrors={transformErrors}
            widgets={widgets}
            id="dynamic-form-id"
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              marginTop: '5px !important',
              mt: 2,
            }}
          >
            <Button
              onClick={handleSendOtp}
              disabled={
                isRateLimited ||
                errorButton ||
                !formData?.firstName ||
                !formData?.password ||
                (!formData?.email && !formData?.mobile) ||
                !formData?.confirm_password ||
                formData.password !== formData.confirm_password ||
                !formData.Role ||
                !formData?.udise ||
                !formData?.Udise ||
                !formData.Username ||
                !isUsernameValid ||
                hasValidationErrors() ||
                (formData.Role !== 'parents' &&
                  formData.Role !== 'others' &&
                  formData.Role !== 'youth' &&
                  (!formData?.['Sub-Role'] ||
                    formData['Sub-Role'].length === 0))
                // !formData?.school ||
                // !formData?.state
              }
              sx={{
                whiteSpace: 'nowrap',
                bgcolor: '#582E92',
                color: '#FFFFFF',
                borderRadius: '30px',
                textTransform: 'none',
                // marginTop: '5px',
                fontWeight: 'bold',
                fontSize: '14px',
                // padding: '8px 5px',
                '&:hover': {
                  bgcolor: '#543E98',
                },
                '&.Mui-disabled': {
                  bgcolor: '#BDBDBD',
                  color: '#FFFFFF',
                },
                width: '50%',
              }}
            >
              Send OTP
            </Button>
            {isRateLimited && rateLimitExpiry && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 1, textAlign: 'center' }}
              >
                Too many requests. Please wait{' '}
                {(() => {
                  const timeLeft = Math.max(0, rateLimitExpiry - currentTime);
                  const minutes = Math.floor(timeLeft / 60000);
                  const seconds = Math.floor((timeLeft % 60000) / 1000);
                  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                })()}{' '}
                before trying again.
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {Object.keys(formSchema.properties).map((key) => (
            <Grid item xs={12} md={4} lg={3} key={key} sx={{ mb: '-40px' }}>
              <Form
                ref={formRef}
                schema={{
                  type: 'object',
                  properties: { [key]: formSchema.properties[key] },
                }}
                uiSchema={{ [key]: formUiSchema[key] }}
                formData={formData}
                fields={fields}
                onChange={(data) => setFormData(data)}
                onSubmit={handleSubmit}
                validator={validator}
                liveValidate //all validate live
                customValidate={customValidate} // Dynamic Validation
                widgets={widgets}
              >
                {!isCallSubmitInHandle ? null : (
                  <button type="submit" style={{ display: 'none' }}>
                    Submit
                  </button>
                )}
              </Form>
            </Grid>
          ))}
        </Grid>
      )}
      <OTPDialog
        open={isOpenOTP}
        data={registerData}
        onClose={() => setIsOpenOTP(false)}
        onSubmit={handleRegister}
        onResendOtp={handleSendOtp}
      />
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Registration Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Welcome,
            <span style={{ fontWeight: 'bold' }}>
              {' '}
              {requestData?.usercreate?.request?.userName}{' '}
            </span>{' '}
            Your account has been successfully registered. Please use your
            username to login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      {/* {errorMessage && <Alert severity={alertSeverity}>{errorMessage}</Alert>} */}
    </>
  );
};

export default DynamicForm;
