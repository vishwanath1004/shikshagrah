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
} from '@mui/material';
import {
  fetchRoleData,
  getSubroles,
  schemaRead,
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const origin = window.location.origin;
      localStorage.setItem('origin', origin);
      const parts = hostname.split('.');

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

      // Step 3: Map or format display name
      const displayName = toPascalCase(
        localStorage.getItem('tenantCode') ?? ''
      );
      setDisplayName(displayName);

      setDisplayName(displayName ? displayName : '');
      if (coreDomain === 'shikshagrah') {
        coreDomain = 'shikshagraha';
      }
      // localStorage.setItem('origin', coreDomain);
    }
  }, []);
  const toPascalCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/(^\w|[^a-zA-Z0-9]+(\w))/g, (_, first, second) =>
        (first || second).toUpperCase()
      );
  };

  // const formatDisplayName = (domain: string): string => {
  //   // Custom rules per domain (if needed)
  //   if (domain === 'shikshagraha') return 'Shikshagraha';
  //   if (domain === 'shikshalokam') return 'Shikshalokam';
  //   if (domain === 'shikshagrah') return 'Shikshagraha';
  //   // Default: Capitalize first letter
  //   return domain.charAt(0).toUpperCase() + domain.slice(1);
  // };

  useEffect(() => {
    const fetchSchema = async () => {
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
          // setSubRoles(subrolesData);
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
        // setFormSchema(schema);
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
  }, []);

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
        p: 2,
        borderBottom: '2px solid #FFD580',
        boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)',
        backgroundColor: '#FFF7E6',
        borderRadius: '0 0 25px 25px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Grid container alignItems="center">
        <Grid item xs={3} sm={2}>
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
        <Grid
          item
          xs={6}
          sm={8}
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
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
              },
            }}
          >
            {displayName}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const theme = createTheme({
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: '16px',
          },
        },
      },
    },
  });

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f5f5f5',
            paddingBottom: '60px',
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
                      xs: '1.2rem',
                      sm: '1.5rem',
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
                  onChange={({ formData }) => {
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
