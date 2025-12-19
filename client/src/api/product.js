// client/src/api/product.js
import axios from "axios";

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ADMIN: list minimal product data for visibility management
export const adminGetProducts = async () => {
    const res = await axios.get(`/api/v1/admin/products`, { headers: authHeaders() });
    return res.data;
};

// ADMIN: set one product visibility
export const adminSetProductVisibility = async (id, visible) => {
    const res = await axios.patch(
        `/api/v1/admin/products/${id}/visibility`,
        { visible },
        { headers: authHeaders() }
    );
    return res.data;
};
