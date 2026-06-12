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

  async importResume(file) {
    const form = new FormData();
    form.append('file', file);
    const response = await axiosInstance.post('/careerhub/api/profile/import-resume', form, {
      baseURL: '',
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteAccount() {
    const response = await axiosInstance.delete('/careerhub/api/auth/delete-account', { baseURL: '' });
    return response.data;
  }
}

export default new UserService();

