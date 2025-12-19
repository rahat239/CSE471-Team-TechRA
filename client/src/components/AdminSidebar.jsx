// frontend/src/components/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import techraLogo from '../../public/assets/images/Logo.svg';

const Item = ({ to, icon, children }) => {
    const { pathname } = useLocation();
    const active = pathname === to;
    return (
        <Link className={`side-item ${active ? 'active' : ''}`} to={to}>
            <i className={`bi ${icon} me-2`} />
            {children}
        </Link>
    );
};

const AdminSidebar = () => {
    return (
        <>
            {/* Brand */}
            <Link to="/" className="brand-wrap" aria-label="TechRA Home">
                <img src={techraLogo} alt="TechRA" className="brand-img" />
                <div className="brand-txt">
                    <div className="brand-name">TechRA</div>
                    <div className="brand-sub">Admin</div>
                </div>
            </Link>

            {/* Nav */}
            <nav className="side-nav">
                <div className="side-section">Dashboard</div>
                <Item to="/admin/dashboard" icon="bi-speedometer2">Dashboard</Item>

                <div className="side-section mt-3">Ecommerce</div>
                <Item to="/admin/manage-brands" icon="bi-badge-ad">Manage Brands</Item>
                <Item to="/admin/manage-categories" icon="bi-collection">Manage Categories</Item>
                <Item to="/admin/product-visibility" icon="bi-eye">Product Visibility</Item>
            </nav>
        </>
    );
};

export default AdminSidebar;
