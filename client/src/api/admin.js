// frontend/src/api/admin.js
import axios from 'axios';

const apiUrl = 'http://localhost:5030/api/v1';

// Helper: attach token from localStorage
const tokenHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleError = (error) => {
    console.error("API Error:", error?.response?.data || error?.message);
    return { status: 'fail', message: error?.response?.data?.message || 'Something went wrong!' };
};

// -------- Metrics (Admin) --------
// Return FULL payload so we can check .status
export const getAdminMetrics = async (range = '30d') => {
    try {
        const res = await axios.get(`${apiUrl}/metrics?range=${range}`, { headers: tokenHeader() });
        return res.data; // {status, data:{...}} on success
    } catch (e) { return handleError(e); }
};

// -------- Categories --------
export const getCategories = async () => {
    try {
        const res = await axios.get(`${apiUrl}/admin/categories`, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

export const createCategory = async (categoryData) => {
    try {
        const res = await axios.post(`${apiUrl}/admin/categories`, categoryData, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

export const updateCategory = async (categoryId, categoryData) => {
    try {
        const res = await axios.patch(`${apiUrl}/admin/categories/${categoryId}`, categoryData, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

export const deleteCategory = async (categoryId) => {
    try {
        const res = await axios.delete(`${apiUrl}/admin/categories/${categoryId}`, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

// -------- Products (admin list + visibility) --------
export const getProducts = async () => {
    try {
        const res = await axios.get(`${apiUrl}/admin/products`, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

export const setProductVisibility = async (productId, visibleData) => {
    try {
        const res = await axios.patch(`${apiUrl}/admin/products/${productId}/visibility`, visibleData, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

// -------- Sliders --------
export const getSliders = async () => {
    try {
        const res = await axios.get(`${apiUrl}/admin/sliders`, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

export const createSlider = async (sliderData) => {
    try {
        const res = await axios.post(`${apiUrl}/admin/sliders`, sliderData, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

export const updateSlider = async (sliderId, sliderData) => {
    try {
        const res = await axios.patch(`${apiUrl}/admin/sliders/${sliderId}`, sliderData, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

export const deleteSlider = async (sliderId) => {
    try {
        const res = await axios.delete(`${apiUrl}/admin/sliders/${sliderId}`, { headers: tokenHeader() });
        return res.data;
    } catch (e) { return handleError(e); }
};

