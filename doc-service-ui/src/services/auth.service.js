import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/careerhub/api/auth/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Silent instance for the verifyAuth probe — no toast/redirect on 401.
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
    /** Step 1 of signup — saves an unverified account and emails an OTP. */
    async signup(fullName, email, password) {
        const response = await axiosInstance.post('signup', { fullName, email, password });
        return response.data; // { message }
    }

    /** Step 2 of signup — verifies the OTP and creates the verified user. */
    async register(fullName, email, password, otp) {
        const response = await axiosInstance.post('register', { fullName, email, password, otp });
        return response.data; // UserResponse
    }

    /** Login — backend sets the httpOnly access-token cookie. */
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

    /**
     * Starts an OAuth login by navigating the browser (full page) to the backend authorization
     * endpoint through the proxy, so the access-token cookie is set on this (:5173) origin.
     */
    loginWithProvider(provider) {
        window.location.href = `/careerhub/oauth2/authorization/${provider}`;
    }

    /** Silently confirm the session cookie is still valid (used on app load). */
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
