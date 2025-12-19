// client/src/api/brand.js
import axios from 'axios';

const apiUrl = 'http://localhost:5030/api/v1';

const tokenHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getBrands = async () => {
    const res = await axios.get(`${apiUrl}/admin/brands`, { headers: tokenHeader() });
    return res.data; // { status, data }
};

export const createBrand = async (brandData) => {
    const res = await axios.post(`${apiUrl}/admin/brands`, brandData, { headers: tokenHeader() });
    return res.data; // { status, data }
};

export const updateBrand = async (brandId, brandData) => {
    const res = await axios.patch(`${apiUrl}/admin/brands/${brandId}`, brandData, { headers: tokenHeader() });
    return res.data; // { status, data }
};

export const deleteBrand = async (brandId) => {
    const res = await axios.delete(`${apiUrl}/admin/brands/${brandId}`, { headers: tokenHeader() });
    return res.data; // { status }
};
