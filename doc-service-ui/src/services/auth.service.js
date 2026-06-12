import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/careerhub/api/auth/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const silentAxios = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('isAuthenticated');
            if (window.location.pathname !== '/login') {
                toast.error('Session expired. Please sign in again.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

class AuthService {
    async signup(fullName, email, password) {
        const response = await axiosInstance.post('signup', { fullName, email, password });
        return response.data; // { message }
    }

    async register(fullName, email, password, otp) {
        const response = await axiosInstance.post('register', { fullName, email, password, otp });
        return response.data; // UserResponse
    }

    async signin(email, password) {
        const response = await axiosInstance.post('signin', { email, password });
        localStorage.setItem('isAuthenticated', 'true');
        return response.data; // UserResponse
    }

    async logout() {
        try {
            const response = await axiosInstance.post('logout');
            return response.data;
        } finally {
            localStorage.removeItem('isAuthenticated');
        }
    }

    /** Current user; throws if not authenticated. */
    async me() {
        const response = await axiosInstance.get('me');
        return response.data; // UserResponse
    }

    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    loginWithProvider(provider) {
        window.location.href = `/careerhub/oauth2/authorization/${provider}`;
    }

    async verifyAuth() {
        try {
            await silentAxios.get('me');
            localStorage.setItem('isAuthenticated', 'true');
        } catch {
            localStorage.removeItem('isAuthenticated');
        }
    }
}

export default new AuthService();
