import React, { useEffect, useState } from 'react';
import { Link, Outlet, redirect } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Loader from 'components/Loader';


import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails } from 'app/authSlice/UserSlice';
import GMBConnect from 'components/GMBConnect';
import { AxiosInstance } from 'utils/AxiosInstance';
import TopHeader from 'components/TopHeader';
import Navbar from 'components/Navbar';

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.userProfile);
  const [accessToken, setAccessToken] = useState(null)
  const [tokenExpiry, setTokenExpire] = useState(localStorage.getItem('gmb_token_expiry'))

  const [isOpen, setIsOpen] = useState(false);



  const storeTokens = (accessToken, refreshToken, expiresIn) => {
    const expiresInMilliseconds = expiresIn * 1000;
    const expirationTime = new Date().getTime() + expiresInMilliseconds;

    localStorage.setItem('gmb_access_token', accessToken);
    localStorage.setItem('gmb_refresh_token', refreshToken);
    localStorage.setItem('gmb_token_expiry', expirationTime);
  };

  const clientId = import.meta.env.VITE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('gmb_refresh_token');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    const { access_token, expires_in } = data;

    // Store the new tokens
    storeTokens(access_token, refreshToken, expires_in);

    return access_token;
  };


  useEffect(() => {
    const refreshToken = localStorage.getItem('gmb_refresh_token');
    if (refreshToken) {
      const refreshInterval = 30 * 60 * 1000; // 30 minutes in milliseconds

      const refreshTokenPeriodically = async () => {
        const newAccessToken = await refreshAccessToken();
        setAccessToken(newAccessToken);
      };

      // Refresh token immediately upon mounting
      refreshTokenPeriodically();

      // Set interval to refresh token every 30 minutes
      const intervalId = setInterval(refreshTokenPeriodically, refreshInterval);

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    handlerDrawerOpen(!downXL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  useEffect(() => {
    let token = localStorage.getItem('token');
    let gmb_refresh_token = localStorage.getItem('gmb_refresh_token');
    async function refreshAccessToken(refreshToken) {
      try {
        // Send a request to your backend server to exchange the refresh token for a new access token
        const response = await AxiosInstance.post(
          'refresh-token',
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
          }
        );

        const data = await response.data;
        const { accessToken } = data;

        return accessToken;
      } catch (error) {
        console.error('Error refreshing token:', error.message);
        throw error;
      }
    }

    if (gmb_refresh_token) {
      refreshAccessToken(gmb_refresh_token)
        .then(response => {
          if (response.expired) {
            // Token has expired
            alert("Your Google My Business session has expired. Please log in again.");
            // You might want to clear the stored tokens here
            localStorage.removeItem('gmb_access_token');
            localStorage.removeItem('gmb_refresh_token');
            // Optionally, redirect to a login page or trigger a re-authentication flow
            // window.location.href = '/login';
          } else if (response.accessToken) {
            // Successfully refreshed
            localStorage.setItem('gmb_access_token', response.accessToken);
          } else {
            throw new Error('Unexpected response format');
          }
        })
        .catch(error => {
          console.error('Failed to refresh token:', error.message);

        });
    }


  }, [])

  useEffect(() => {

    let token = localStorage.getItem('token');
    let access_token = localStorage.getItem('gmb_access_token');

    setAccessToken(access_token);

    dispatch(fetchUserDetails());


    if (error === "Invalid token") {
      localStorage.clear();
      window.location.href = "login"
    }

  }, [error]);


  const verifyToken = async (token) => {
    try {
      const response = await AxiosInstance.post('verify-token', { token });
      return response.data.valid;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  };

  useEffect(() => {

    let token = localStorage.getItem('token');

    if (token == null || token == undefined || token == "") {
      window.location.href = "login"
    }



  }, []);


  if (menuMasterLoading) return <Loader />;

  if (loading) return <Loader />;

  return (
    <Box>
      <TopHeader setIsOpen={setIsOpen} isOpen={isOpen} />
      <Navbar isOpen={isOpen} />
      <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }} className='container'>
        {accessToken ? <Outlet /> : <GMBConnect />}
      </Box>
    </Box>
  );

}
