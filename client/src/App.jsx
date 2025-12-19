// frontend/src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/home-page.jsx";
import ProductByBrand from "./pages/product-by-brand.jsx";
import ProductByCategory from "./pages/product-by-category.jsx";
import ProductByKeyword from "./pages/product-by-keyword.jsx";
import ProductDetails from "./pages/product-details.jsx";
import AboutPage from "./pages/about-page.jsx";
import RefundPage from "./pages/refund-page.jsx";
import PrivacyPage from "./pages/privacy-page.jsx";
import TermsPage from "./pages/terms-page.jsx";
import HowToBuyPage from "./pages/how-to-buy-page.jsx";
import ContactPage from "./pages/contact-page.jsx";
import ComplainPage from "./pages/complain-page.jsx";
import LoginPage from "./pages/login-page.jsx";
import OtpPage from "./pages/otp-page.jsx";
import ProfilePage from "./pages/profile-page.jsx";
import WishPage from "./pages/wish-page.jsx";
import CartPage from "./pages/cart-page.jsx";
import OrderPage from "./pages/order-page.jsx";
import InvoicePage from "./pages/invoice-page.jsx";
import PcBuilderPage from "./pages/pc-builder.jsx";
import AIRecommendationPage from "./pages/AIRecommendationPage.jsx";
// Admin pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageBrands from "./pages/ManageBrands.jsx";
import ManageCategories from "./pages/ManageCategories.jsx";


function ScrollToTopOnNavigation() {
    const { pathname } = useLocation();
    useEffect(() => { requestAnimationFrame(() => window.scrollTo(0, 0)); }, [pathname]);
    return null;
}

// helpers for guard
const getCookie = (name) =>
    document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1] || '';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const str = atob(padded);
        const json = decodeURIComponent(
            str.split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

const RequireAdmin = ({ children }) => {
    const token = localStorage.getItem('token') || getCookie('token') || '';
    if (!token) return <Navigate to="/login" replace />;
    const payload = parseJwt(token);
    const email = (payload?.email || '').toLowerCase();
    const role = payload?.role;
    const ok = role === 'admin' || email === 'rahatahmed537@gmail.com';
    if (!ok) return <Navigate to="/" replace />;
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <ScrollToTopOnNavigation />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/by-brand/:id" element={<ProductByBrand />} />
                <Route path="/by-category/:id" element={<ProductByCategory />} />
                <Route path="/by-keyword/:keyword" element={<ProductByKeyword />} />
                <Route path="/details/:id" element={<ProductDetails />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/refund" element={<RefundPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/how-to-buy" element={<HowToBuyPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/complain" element={<ComplainPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/otp" element={<OtpPage />} />
                <Route path="/wish" element={<WishPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/invoice/:id" element={<InvoicePage />} />
                <Route path="/pc-builder" element={<PcBuilderPage />} />
                <Route path="/ai-recommendation" element={<AIRecommendationPage />} />

                {/* Admin Routes (guarded) */}
                <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="/admin/manage-brands" element={<RequireAdmin><ManageBrands /></RequireAdmin>} />
                <Route path="/admin/manage-categories" element={<RequireAdmin><ManageCategories /></RequireAdmin>} />

            </Routes>
        </BrowserRouter>
    );
};

export default App;
