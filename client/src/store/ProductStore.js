import create from 'zustand';
import axios from "axios";

const ProductStore = create((set) => ({
    // Initialize brand list state
    BrandList: null,
    BrandListRequest: async () => {
        let res = await axios.get(`/api/v1/ProductBrandList`);
        if (res.data['status'] === "success") {
            set({ BrandList: res.data['data'] });
        }
    },

    // Initialize category list state
    CategoryList: null,
    CategoryListRequest: async () => {
        let res = await axios.get(`/api/v1/ProductCategoryList`);
        if (res.data['status'] === "success") {
            set({ CategoryList: res.data['data'] });
        }
    },

    // Initialize slider list state
    SliderList: null,
    SliderListRequest: async () => {
        let res = await axios.get(`/api/v1/ProductSliderList`);
        if (res.data['status'] === "success") {
            set({ SliderList: res.data['data'] });
        }
    },

    // Initialize ListByRemark state
    ListByRemarkRequest: async (Remark) => {
        set({ ListByRemark: null });  // Reset data
        try {
            const res = await axios.get(`/api/v1/ProductListByRemark/${Remark}`);
            console.log("API Response:", res.data);  // Log the response to check if data is received

            // If the response data is an array, we can directly set it
            if (Array.isArray(res.data)) {
                set({ ListByRemark: res.data });  // Set ListByRemark to the array data
            } else if (res.data['status'] === "success" && Array.isArray(res.data['data'])) {
                set({ ListByRemark: res.data['data'] });  // Handle object response if the structure is different
            } else {
                console.error("Unexpected response structure:", res.data);
                set({ ListByRemark: [] });  // Set an empty array if the structure is unexpected
            }
        } catch (error) {
            console.error("Error fetching products by remark:", error);
            set({ ListByRemark: [] });  // Set an empty array in case of an error
        }
    },


    // Initialize ListProduct state
    ListProduct: null,
    ListByBrandRequest: async (BrandID) => {
        set({ ListProduct: null });  // Reset data
        let res = await axios.get(`/api/v1/ProductListByBrand/${BrandID}`);
        if (res.data['status'] === "success") {
            set({ ListProduct: res.data['data'] });
        }
    },

    ListByCategoryRequest: async (CategoryID) => {
        set({ ListProduct: null });  // Reset data
        let res = await axios.get(`/api/v1/ProductListByCategory/${CategoryID}`);
        if (res.data['status'] === "success") {
            set({ ListProduct: res.data['data'] });
        }
    },

    ListByKeywordRequest: async (Keyword) => {
        set({ ListProduct: null });  // Reset data
        let res = await axios.get(`/api/v1/ProductListByKeyword/${Keyword}`);
        if (res.data['status'] === "success") {
            set({ ListProduct: res.data['data'] });
        }
    },

    ListByFilterRequest: async (postBody) => {
        set({ ListProduct: null });  // Reset data
        let res = await axios.post(`/api/v1/ProductListByFilter`, postBody);
        if (res.data['status'] === "success") {
            set({ ListProduct: res.data['data'] });
        }
    },

    // State for managing search keywords
    SearchKeyword: "",
    SetSearchKeyword: async (keyword) => {
        set({ SearchKeyword: keyword });
    },

    // Initialize details state
    Details: null,
    DetailsRequest: async (id) => {
        let res = await axios.get(`/api/v1/ProductDetails/${id}`);
        if (res.data['status'] === "success") {
            set({ Details: res.data['data'] });
        }
    },

    // Initialize review list state
    ReviewList: null,
    ReviewListRequest: async (id) => {
        let res = await axios.get(`/api/v1/ProductReviewList/${id}`);
        if (res.data['status'] === "success") {
            set({ ReviewList: res.data['data'] });
        }
    },
}));

export default ProductStore;
