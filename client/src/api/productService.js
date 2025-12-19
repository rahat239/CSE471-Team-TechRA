import axios from 'axios';

const apiUrl = 'http://localhost:5030/api/v1';

// Helper function to get the token from localStorage and add it to the request headers
const tokenHeader = () => {
    const token = localStorage.getItem('token');  // Get token from localStorage
    return token ? { Authorization: `Bearer ${token}` } : {};  // If token exists, add to headers
};

// Fetch products with authentication
export const getProducts = async () => {
    try {
        const res = await axios.get(`${apiUrl}/admin/products`, {
            headers: tokenHeader(),  // Send token in the request headers
        });
        return res.data;  // Return the data from the response
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;  // Throw the error for handling in the component
    }
};

// Update product visibility with authentication
export const setProductVisibility = async (productId, visibleData) => {
    try {
        const res = await axios.patch(`${apiUrl}/admin/products/${productId}/visibility`, visibleData, {
            headers: tokenHeader(),  // Send token in the request headers
        });
        return res.data;  // Return the updated product data
    } catch (error) {
        console.error('Error updating product visibility:', error);
        throw error;  // Throw the error for handling in the component
    }
};
