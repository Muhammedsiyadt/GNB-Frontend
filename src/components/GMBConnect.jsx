import { Button, Typography } from '@mui/material'
import { Container } from '@mui/system'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { AxiosInstance } from 'utils/AxiosInstance';
import FullScreenLoader from './FullScreenLoader';


function GMBConnect() {

    const [IsAuth, setIsAuth] = useState(true);
    const [fullScreenLoader, setFullScreenLoader] = useState(true);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    const [accountId, setAccountId] = useState(null);
    const [clientId1, setClientId] = useState(null);

    const clientId = import.meta.env.VITE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_PUBLIC_URL;
    const scopes = 'https://www.googleapis.com/auth/business.manage';

    useEffect(() => {
        let gmb_access_token = localStorage.getItem('gmb_access_token');
        let gmb_client_id = localStorage.getItem('gmb_client_id');
        let accounts = localStorage.getItem('gmb_account_name');
        setAccessToken(gmb_access_token);
        setClientId(gmb_client_id);
        setAccountId(accounts)
    }, [])


    async function triggerGMB() {
        try {
            setLoading(true);

            // Add access_type=offline and prompt=consent to the authorization URL
            const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;

            // Redirect the user to the authorization URL
            window.location.href = authorizationUrl;

        } catch (error) {
            setLoading(false);
            console.log(error.message);
            alert('something went wrong please try again later');
        }
        finally {
            setLoading(false);
        }
    }




    useEffect(() => {
        if (accountId === null) {
            console.log('Account id was not specified');
            setFullScreenLoader(false); return
        } else {
            console.log('Account id was specified');
        }
    }, [accountId]);

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            if (code) {
                setFullScreenLoader(true);
                try {

                    const response = await axios.post('https://oauth2.googleapis.com/token', {
                        code,
                        client_id: clientId,
                        client_secret: clientSecret,
                        redirect_uri: redirectUri,
                        grant_type: 'authorization_code',
                    });
                    const { access_token, refresh_token } = response.data;
                    const expiresIn = params.get('expires_in');

                    // Save the access token and client ID in localStorage
                    localStorage.setItem('gmb_access_token', access_token);
                    localStorage.setItem('gmb_refresh_token', refresh_token);
                    localStorage.setItem('gmb_token_expiry', expiresIn);
                    let token = localStorage.getItem('token');


                    // Fetch GMB accounts using the access token



                    const url = `${import.meta.env.VITE_API_BASE_URL}connected-accounts?access_token=${access_token}`;

                    const response1 = await axios.get(url, {
                        headers: {
                            Authorization: token,
                        },
                    });


                    const accountName1 = response1.data;
                    const accountName = accountName1.accountName;
                    const accountId = accountName1.accountId;
                    localStorage.setItem('gmb_account_name', accountName);
                    localStorage.setItem('gmb_account_id', accountId);


                    window.location.href = "locations";
                    setFullScreenLoader(false);
                } catch (error) {
                    setFullScreenLoader(false);
                    console.error('Error fetching access token:', error);
                }
            }
        };

        handleCallback();
    }, []);



    // Function to redirect to the authorization URL
    const redirectToAuthorization = () => {
        const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
        window.location.href = authorizationUrl;

        // Clean up localStorage
        localStorage.removeItem('gmb_access_token');
        localStorage.removeItem('gmb_refresh_token');
        localStorage.removeItem('gmb_token_expiry');
        localStorage.removeItem('gmb_account_name');
        localStorage.removeItem('gmb_account_id');
    };


    return (
        <div
            style={{
                // Manually set background color

                // Manually set padding

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
            }}
        >
            {fullScreenLoader ? <FullScreenLoader /> : <>
                <Container maxWidth="md">
                    <Typography variant="h1" component="h1" gutterBottom>
                        Connect Your Google My Business Account
                    </Typography>
                    <Typography variant="h4" component="p" paragraph>
                        Access powerful tools to manage and optimize your Google My Business listing.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={triggerGMB}>
                        <strong>Connect Now</strong>
                    </Button>
                </Container>
            </>}

        </div>
    )
}

export default GMBConnect