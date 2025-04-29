// src/api/adminUsers.js
import axios from './api';

export const getUsers = () => axios.get('/admin/users/');
export const createUser = (data) => axios.post('/admin/users/', data);
export const updateUser = (id, data) => axios.patch(`/admin/users/${id}/`, data);
export const deleteUser = (id) => axios.delete(`/admin/users/${id}/`);
export const getGeneralUsers = () => axios.get('/admin/users/general_users/');
export const approveGeneralUser = (id) => axios.post(`/admin/users/${id}/approve_user/`);
