import React, { useEffect, useState } from 'react';
import Layout from "../components/layout/layout.jsx";
import Brands from "../components/product/brands.jsx";
import ProductStore from "../store/ProductStore.js";
import FeatureStore from "../store/FeatureStore.js";
import Slider from "../components/product/slider.jsx";
import Features from "../components/Features/features.jsx";
import Categories from "../components/product/categories.jsx";
import Products from "../components/product/products.jsx";

const HomePage = () => {
    const { BrandListRequest, CategoryListRequest, SliderListRequest, ListByRemarkRequest } = ProductStore();
    const { FeatureListRequest } = FeatureStore();

    // State to handle loading and error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);  // Set loading to true at the start
                setError(null);  // Reset any previous errors

                // Use Promise.all to make requests concurrently
                await Promise.all([
                    SliderListRequest(),
                    FeatureListRequest(),
                    CategoryListRequest(),
                    ListByRemarkRequest("new"), // Default remark
                    BrandListRequest(),
                ]);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data. Please try again.");
            } finally {
                setLoading(false); // Set loading to false after data is fetched or an error occurs
            }
        };

        fetchData();
    }, [SliderListRequest, FeatureListRequest, CategoryListRequest, ListByRemarkRequest, BrandListRequest]);

    // Show loading message or spinner
    if (loading) {
        return <div>Loading...</div>;
    }

    // Show error message if there was a problem fetching data
    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={fetchData}>Retry</button>
            </div>
        );
    }

    return (
        <Layout>
            <Slider />
            <Features />
            <Categories />
            <Products />
            <Brands />
        </Layout>
    );
};

export default HomePage;
