import axios from "axios";
import {getSession, signOut} from 'next-auth/react'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosClient.interceptors.request.use(
    async (config) => {

        const session = await getSession();

        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const session = await getSession();
    
    if (session?.error === "RefreshAccessTokenError" || error.response?.status === 401) {

      signOut({ callbackUrl: '/login' });
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;