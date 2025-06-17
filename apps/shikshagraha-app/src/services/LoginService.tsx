import axios from 'axios';
import { useRouter } from 'next/router';
import { API_ENDPOINTS } from '../utils/API/APIEndpoints';

interface LoginParams {
  username: string;
  password: string;
}
interface AuthParams {
  token: string;
}
interface TenantParams {
  tenantId: string;
  token: string;
}
interface AuthParamsProfile {
  token: string;
  userId: string;
  tenantId: string;
}
export const signin = async ({
  username,
  password,
}: LoginParams): Promise<any> => {
  const apiUrl: string = `${API_ENDPOINTS.accountLogin}`;
  console.log('username:', username);
  console.log('apiUrl:', apiUrl);
  const isMobile = /^[6-9]\d{9}$/.test(username);
  const requestBody: any = {
    identifier: username,
    password,
    ...(isMobile ? { phone_code: '+91' } : {}),
  };

  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response?.data;
  } catch (error) {
    console.error('Login error:', error);
    return error;
  }
};

export const authenticateLoginUser = async ({
  token,
}: AuthParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/auth`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`, // Token passed as a parameter
      },
    });
    return response?.data;
  } catch (error) {
    console.error('error in login', error);
    // throw error;
    return error;
  }
};
export const readHomeListForm = async (token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
  }

  const apiUrl = `${baseUrl}/user/v1/form/read`;
  const payloadData = {
    type: 'solutionList',
    sub_type: 'home',
  };

  try {
    const { data } = await axios.post(apiUrl, payloadData, {
      headers: {
        'X-Auth-Token': token,
      },
    });
    return data;
  } catch (err: unknown | any) {
    if (err.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE + "?unAuth=true" || '';
    }
    if (axios.isAxiosError(err)) {
      console.error(
        'Error fetching tenant data:',
        err.response?.status,
        err.response?.data
      );
      throw new Error(`API error: ${err.response?.status}`);
    }
    console.error('Unexpected error:', err);
    throw err;
  }
};
export const authenticateUser = async ({
  token,
  userId,
  tenantId,
}: AuthParamsProfile): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/read/${userId}?fieldvalue=true`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: 'ebae40d1-b78a-4f73-8756-df5e4b060436', // Token passed as a parameter
      },
    });
    if (response.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE + "?unAuth=true" || '';
    }

    return response?.data;
  } catch (error: any) {
    if (error.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE + "?unAuth=true" || '';
    }
    console.error('error in login', error);
    // throw error;
    return error;
  }
};

export const fetchTenantData = async ({
  tenantId,
  token,
}: TenantParams): Promise<any> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/tenant/read`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { tenantId }, // Passing tenantId as a query parameter
    });

    if (response.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE + "?unAuth=true" || '';
    }

    return response?.data;
  } catch (error: any) {
    if (error.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE + "?unAuth=true" || '';
    }
    console.error('Error fetching tenant data:', error);
    return error;
  }
};

export const fetchRoleData = async (): Promise<any> => {
  const apiUrl = `${API_ENDPOINTS.roleRead}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        tenantId: `shikshagraha`,
      },
    });

    return response?.data;
  } catch (error: any) {
    console.error('Error fetching tenant data:', error);
    return error;
  }
};
export const getSubroles = async (parentEntityId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/entity-management/v1/entities/subEntityList/${parentEntityId}?type=professional_subroles`,
    {
      headers: {
        tenantId: 'shikshagraha',
        'Content-Type': 'application/json',
      },
    }
  );
  return await response.json();
};
export const schemaRead = async (): Promise<any> => {
  const apiUrl: string = `${API_ENDPOINTS.formRead}`;
  console.log(apiUrl);
  const requestOrigin =
    localStorage.getItem('origin') ?? 'shikshagraha-qa.tekdinext.com';
  try {
    const response = await axios.post(
      apiUrl,
      {
        type: 'user',
        sub_type: 'registration',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Origin: origin,
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE + "?unAuth=true" || '';
    }

    return response?.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE + "?unAuth=true" || '';
    }
    console.error('error in schemaRead', error);
    return error;
  }
};

export const registerUserService = async (requestData: any) => {
  const modifiedRequestData = requestData?.requestData || requestData;

  try {
    const response = await axios.post(
      `${API_ENDPOINTS.userCreate}`,
      modifiedRequestData,
      {
        headers: {
          Origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
          Referer: 'http://localhost:3000/',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error submitting registration data:', error);
      return error.response;
    } else {
      console.error('Unexpected error:', error);
      return error;
    }
  }
};

export const fetchContentOnUdise = async (udise: string): Promise<any> => {
  const apiUrl = `${API_ENDPOINTS.udiseSearch(udise)}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        tenantId: 'shikshagraha',
      },
    });
    return response?.data;
  } catch (error) {
    console.error('error in fetching user details', error);
    return error;
  }
};

export const sendOtp = async (requestData: any) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.sendOtp}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        // 'X-auth-token': '', // If token is dynamic, pass it as param
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error sending OTP:', error.response?.data);
      return error.response?.data;
    } else {
      console.error('Unexpected error:', error);
    }
  }
};
export const sendForgetOtp = async (requestData: any) => {
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.sendForgetOtp}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          // 'X-auth-token': '', // If token is dynamic, pass it as param
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error sending OTP:', error.response?.data);
      return error.response?.data;
    } else {
      console.error('Unexpected error:', error);
    }
  }
};


;
export const readIndividualTenantData = async (tenantId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
  }

  const apiUrl = `${baseUrl}/interface/v1/user/tenant/read/${tenantId}`;

  try {
    const { data } = await axios.get(apiUrl);
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        'Error fetching tenant data:',
        err.response?.status,
        err.response?.data
      );
      throw new Error(`API error: ${err.response?.status}`);
    }
    console.error('Unexpected error:', err);
    throw err;
  }
};
export const verifyOtpService = async (requestData: any) => {
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.ForgotPassword}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Origin: 'localhost',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error resetting password:', error.response?.data);
      return error.response?.data;
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

export const resetPassword = async (payload: {
  newPassword: string;
  token: string;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/forgot-password`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error during resetPassword API call:', error);
    throw error;
  }
};
