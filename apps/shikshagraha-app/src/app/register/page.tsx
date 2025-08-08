'use client';
import { useEffect, useState, useRef } from 'react';
import { generateRJSFSchema } from '../../utils/generateSchemaFromAPI';
import DynamicForm from '../../Components/DynamicForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Grid,
  Typography,
  createTheme,
  ThemeProvider,
  CircularProgress,
  CssBaseline,
} from '@mui/material';
import {
  fetchRoleData,
  getSubroles,
  schemaRead,
  fetchBranding,
} from '../../services/LoginService';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formSchema, setFormSchema] = useState<any>();
  const [uiSchema, setUiSchema] = useState<any>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState();
  const [fieldNameToFieldIdMapping, setFieldNameToFieldIdMapping] = useState(
    {}
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [domain, setDomain] = useState<string>('');
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [subRoles, setSubRoles] = useState<any[]>([]);
  const previousRole = useRef<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [tenantConfigured, setTenantConfigured] = useState(false);

  // First useEffect: Initialize tenant configuration
  useEffect(() => {
    const initializeTenant = async () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const origin = window.location.origin;
        const parts = hostname.split('.');
        localStorage.setItem('origin', origin);

        const skipList = [
          'app',
          'www',
          'dev',
          'staging',
          'tekdinext',
          'org',
          'com',
          'net',
        ];

        // Step 1: Find the most likely base domain part
        const domainPart =
          parts.find((part) => !skipList.includes(part.toLowerCase())) ||
          'default';

        // Step 2: Remove suffixes like -qa, -dev, etc. if present
        const knownSuffixes = ['-qa', '-dev', '-staging'];
        let coreDomain = knownSuffixes.reduce((name, suffix) => {
          return name.endsWith(suffix) ? name.replace(suffix, '') : name;
        }, domainPart);

        if (coreDomain === 'shikshagrah') {
          coreDomain = 'shikshagraha';
        }

        try {
          console.log('Fetching branding for domain:', coreDomain);
          const brandingData = await fetchBranding(coreDomain);

          if (brandingData && brandingData.result) {
            console.log('Branding data received:', brandingData.result);
            const tenantCode = brandingData.result.code;
            const tenantId = brandingData.result.id;

            // Set both tenantCode and tenantId in localStorage
            localStorage.setItem('tenantCode', tenantCode);
            localStorage.setItem('tenantId', tenantId);

            setDisplayName(toPascalCase(tenantCode));
            setTenantConfigured(true);
            console.log('Tenant configured successfully:', {
              tenantCode,
              tenantId,
            });
          } else {
            // Fallback for incognito mode or when branding fails
            console.warn(
              'Branding data not available, using fallback tenant configuration'
            );
            const fallbackTenantCode = 'shikshagraha';
            const fallbackTenantId =
              process.env.NEXT_PUBLIC_TENANT_ID ||
              'fbe108db-e236-48a7-8230-80d34c370800';

            localStorage.setItem('tenantCode', fallbackTenantCode);
            localStorage.setItem('tenantId', fallbackTenantId);

            setDisplayName(toPascalCase(fallbackTenantCode));
            setTenantConfigured(true);
            console.log('Fallback tenant configured:', {
              fallbackTenantCode,
              fallbackTenantId,
            });
          }
        } catch (error) {
          console.error('Error fetching branding:', error);
          // Fallback for incognito mode or when branding fails
          const fallbackTenantCode = 'shikshagraha';
          const fallbackTenantId =
            process.env.NEXT_PUBLIC_TENANT_ID ||
            'fbe108db-e236-48a7-8230-80d34c370800';

          localStorage.setItem('tenantCode', fallbackTenantCode);
          localStorage.setItem('tenantId', fallbackTenantId);

          setDisplayName(toPascalCase(fallbackTenantCode));
          setTenantConfigured(true);
          console.log('Error fallback tenant configured:', {
            fallbackTenantCode,
            fallbackTenantId,
          });
        }
      }
    };

    initializeTenant();
  }, []);

  const toPascalCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/(^\w|[^a-zA-Z0-9]+(\w))/g, (_, first, second) =>
        (first || second).toUpperCase()
      );
  };

  // Second useEffect: Fetch schema and other data only after tenant is configured
  useEffect(() => {
    const fetchSchema = async () => {
      // Wait for tenant configuration to complete
      if (!tenantConfigured) {
        console.log('Waiting for tenant configuration...');
        return;
      }

      console.log('Tenant configured, fetching schema...');
      try {
        setLoading(true);
        const origin = localStorage.getItem('origin') || '';
        const isShikshalokam = origin.includes('shikshalokam');
        console.log('isShikshalokam', isShikshalokam);

        const rolesResponse = await fetchRoleData();
        const rolesData = rolesResponse?.result ?? [];
        setRolesList(rolesData);

        const response = await schemaRead();
        const fields = response?.result?.data?.fields?.result ?? [];
        const meta = response?.result?.data?.fields?.meta ?? {};
        console.log('meta', meta);
        if (fields.length === 0) {
          throw new Error('No form fields received from API');
        }

        let subrolesData = [];
        const selectedRoleObj = rolesData.find((role: any) => role.externalId);
        if (selectedRoleObj) {
          const subrolesResponse = await getSubroles(selectedRoleObj._id);
          subrolesData = subrolesResponse.result ?? [];
        }

        const { schema, uiSchema, fieldNameToFieldIdMapping } =
          generateRJSFSchema(fields, selectedRoleObj, rolesData, subrolesData);
        if (subrolesData?.length === 0) {
          delete schema.properties?.['Sub-Role'];
          delete uiSchema?.['Sub-Role'];
        }

        console.log('schema', schema);
        const registrationCodeConfig = meta.registration_code;

        setFormSchema({
          ...schema,
          meta: {
            ...schema.meta,
            isShikshalokam,
            registrationCodeConfig,
          },
        });
        setUiSchema(uiSchema);
        setFieldNameToFieldIdMapping(fieldNameToFieldIdMapping);
      } catch (error) {
        console.error('Error fetching schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, [tenantConfigured]);

  const handleSubmit = ({ formData }: any) => {
    setFormData(formData);
  };

  const handleBack = () => {
    router.push('/');
  };

  useEffect(() => {
    if (formSchema && uiSchema) {
      console.log('Final Role field schema:', {
        schema: formSchema.properties?.Role,
        uiSchema: uiSchema?.Role,
        rolesList,
      });
    }
  }, [formSchema, uiSchema]);

  const StaticHeader = () => (
    <Box
      sx={{
        borderBottom: '2px solid #FFD580',
        boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)',
        backgroundColor: '#FFF7E6',
        borderRadius: '0 0 25px 25px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Grid container alignItems="center" sx={{ p: 2, minHeight: '60px' }}>
        <Grid item xs={4} sm={3} md={2}>
          <Button
            onClick={handleBack}
            sx={{
              color: '#572E91',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: { xs: '14px', sm: '16px' },
              minWidth: 'auto',
              padding: { xs: '6px 8px', sm: '8px 12px' },
              '&:hover': {
                backgroundColor: '#F5F5F5',
              },
            }}
          >
            <ArrowBackIcon
              sx={{ marginRight: '4px', fontSize: { xs: '18px', sm: '20px' } }}
            />
            Back
          </Button>
        </Grid>
        <Grid
          item
          xs={4}
          sm={6}
          md={8}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            paddingLeft: { xs: '4px', sm: '16px' },
            paddingRight: { xs: '4px', sm: '16px' },
            minWidth: 0, // Add this to ensure text truncation works

          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#572E91',
              fontWeight: 'bold',
              fontSize: {
                xs: '16px',
                sm: '18px',
                md: '20px',
              },
              textAlign: 'center',

              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              maxWidth: { xs: '200px', sm: '300px', md: '400px' },
              margin: '0 auto',
              lineHeight: 1.2,
            }}
          >
            {displayName}
          </Typography>
        </Grid>
        <Grid item xs={4} sm={3} md={2} />
      </Grid>
    </Box>
  );

  const theme = createTheme({
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: '14px',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          },
          html: {
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          },
        },
      },
    },
  });

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f5f5f5',
            paddingBottom: '60px',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          }}
        >
          <StaticHeader />
          <Box
            sx={{
              ml: 'auto',
              mr: 'auto',
              width: {
                xs: '90vw',
                md: '50vw',
              },
              display: 'flex',
              flexDirection: 'column',
              // bgcolor: '#fff',
              p: {
                xs: '20px',
                md: '40px',
              },
            }}
          >
            {loading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px',
                }}
              >
                <CircularProgress sx={{ color: '#572E91' }} />
              </Box>
            )}
            {formSchema && (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#572E91',
                    fontWeight: 'bold',
                    mb: 2,
                    textAlign: 'center',
                    fontSize: {
                      xs: '20px',
                      sm: '20px',
                    },
                  }}
                >
                  Welcome to {displayName}
                </Typography>
                <DynamicForm
                  schema={formSchema}
                  uiSchema={uiSchema}
                  SubmitaFunction={handleSubmit}
                  hideSubmit={false}
                  onChange={({ formData }: { formData: any }) => {
                    // if (formData.Role) {
                    //   setFormData((prev) => ({ ...prev, 'Sub-Role': [] }));
                    // }
                    setFormData(formData);
                  }}
                  fieldIdMapping={fieldNameToFieldIdMapping}
                />
              </>
            )}
          </Box>
        </Box>
      </ThemeProvider>
    );
  } else {
    const redirectUrl = '/';
    router.push(redirectUrl);
  }
}
