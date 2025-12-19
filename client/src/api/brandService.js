import axios from 'axios';

const apiUrl = 'http://localhost:5030/api/v1';  // Your backend API URL

// Get all brands
export const getBrands = async () => {
    try {
        const response = await axios.get(`${apiUrl}/brands`);
        return response.data;  // Assuming the response contains 'data' field
    } catch (error) {
        console.error('Error fetching brands:', error);
        throw error;
    }
};

// Create a new brand
export const createBrand = async (brandData) => {
    try {
        const response = await axios.post(`${apiUrl}/brands`, brandData);
        return response.data;
    } catch (error) {
        console.error('Error creating brand:', error);
        throw error;
    }
};

// Update an existing brand
export const updateBrand = async (brandId, brandData) => {
    try {
        const response = await axios.patch(`${apiUrl}/brands/${brandId}`, brandData);
        return response.data;
    } catch (error) {
        console.error('Error updating brand:', error);
        throw error;
    }
};

// Delete a brand
export const deleteBrand = async (brandId) => {
    try {
        const response = await axios.delete(`${apiUrl}/brands/${brandId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting brand:', error);
        throw error;
    }
};
