import axios from 'axios';

const API_URL = '/careerhub/api/users/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

class UserService {
  async getProfile() {
    const response = await axiosInstance.get('/careerhub/api/auth/me', { baseURL: '' });
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await axiosInstance.patch('/careerhub/api/auth/profile', profileData, { baseURL: '' });
    return response.data;
  }

  async deleteAccount() {
    const response = await axiosInstance.delete('/careerhub/api/auth/delete-account', { baseURL: '' });
    return response.data;
  }
}

export default new UserService();

