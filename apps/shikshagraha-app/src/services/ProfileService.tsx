// src/services/profileService.ts
import { API_ENDPOINTS } from '../utils/API/APIEndpoints';
import axios from 'axios';
interface MyCourseDetailsProps {
  token: string | null;
  userId: string | null;
}
interface AuthParams {
  token: string;
  userId: string;
}

export const fetchProfileData = async (userId: string, token: string) => {
  try {
    const response = await fetch(API_ENDPOINTS.userProfileRead, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-auth-token': `${token}`,
      },
    });

    if (!response.ok) {
      if (response.status == 401) {
        localStorage.removeItem('accToken');
        localStorage.clear();
      }
      window.location.href = window.location.origin + "?unAuth=true" || '';
      throw new Error('Failed to fetch profile data');
    }

    const data = await response.json();
    return data.result?.response || data.result;
  } catch (error:any) {
    if (error.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = window.location.origin + "?unAuth=true" || '';
    }
    console.error('Error fetching profile data:', error);
    return null;
  }
};

export const fetchLocationDetails = async (locations: any[]) => {
  try {
    const responses = await Promise.all(
      locations.map(async (location: { id: any }) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_LOCATION_SEARCH}`,
          {
            method: 'POST',
            headers: {
              Authorization: process.env.NEXT_PUBLIC_AUTH || '', // Ensure it's always a string
              'Content-Type': 'application/json',
            } as HeadersInit, // Explicitly cast as HeadersInit
            body: JSON.stringify({
              request: {
                filters: {
                  id: location.id,
                },
              },
            }),
          }
        );

        const result = await response.json();

        return result.result.response && result.result.response.length > 0
          ? result.result.response[0]
          : null;
      })
    );

    return responses.filter((item) => item !== null);
  } catch (error) {
    console.error('Error fetching location details:', error);
    return [];
  }
};

export const updateProfile = async (
  userId: string | null,
  selectedValues: { board: any; medium: any; gradeLevel: any; subject: any }
) => {
  const { board, medium, gradeLevel, subject } = selectedValues;

  // Filter out 'N/A' from each field
  const filterNA = (arr: any) =>
    (arr || []).filter((item: string) => item !== 'N/A');

  const requestData = {
    request: {
      userId,
      framework: {
        board: filterNA(board),
        gradeLevel: filterNA(gradeLevel),
        id: localStorage.getItem('frameworkname'), // Update with actual ID if dynamic
        medium: filterNA(medium),
        subject: filterNA(subject),
      },
    },
  };

  console.log('requestData', requestData); // Confirm N/A values are removed

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_UPDATE_USER}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${process.env.NEXT_PUBLIC_AUTH}`, // Replace with actual token
          'x-authenticated-user-token': localStorage.getItem('accToken') ?? '', // Add null check
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const deleteUser = async () => {
  const headers = {
    Authorization: process.env.NEXT_PUBLIC_AUTH,
    'Content-Type': 'application/json',
    'x-authenticated-user-token': localStorage.getItem('accToken'),
  };
  const req = {
    request: {
      userId: localStorage.getItem('userId'),
    },
  };

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_DELETE_USER}`,
      req,
      { headers }
    );
    return response.data; // Return response to be handled in the component
  } catch (error) {
    return error || 'Error verifying OTP';
  }
};

function async() {
  throw new Error('Function not implemented.');
}

export const myCourseDetails = async ({
  token,
  userId,
}: MyCourseDetailsProps): Promise<any> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_SSUNBIRD_BASE_URL}/tracking/user_certificate/status/search`;
  try {
    const response = await axios.post(
      apiUrl,
      {
        filters: {
          userId: userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          tenantId: localStorage.getItem('tenantId') ?? '',
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};

export const renderCertificate = async (
  credentialId: string,
  templateId?: string
): Promise<string> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_SSUNBIRD_BASE_URL}/tracking/certificate/render`;

  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot access localStorage in server environment');
    }
    const response = await axios.post(
      apiUrl,
      {
        credentialId,
        templateId: 'cm9r175dm0000qa0ijqfdvlgv',
      },
      {
        headers: {
          tenantId: localStorage.getItem('tenantId') ?? '',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error rendering certificate:', error);
    throw error;
  }
};

export const deleteUserAccount = async (
  token: string,
  password: string
): Promise<any> => {
  const url = API_ENDPOINTS.deleteAccount;

  const headers = {
    'X-auth-token': token,
    'Content-Type': 'application/json',
  };

  const data = {
    password: password,
  };

  try {
    const response = await axios.delete(url, {
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};
export const resetUserPassword = async (
  oldPassword: string,
  newPassword: string,
  token: string
) => {
  try {
    const response = await fetch(API_ENDPOINTS.resetPassword, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-auth-token': token,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      const message =
        data?.error?.[0]?.msg || data?.message || 'Failed to reset password';
      return { success: false, errorMessage: message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      errorMessage: 'Something went wrong. Please try again.',
    };
  }
};
