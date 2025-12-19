// frontend/src/components/AdminNavbar.jsx
import React from 'react';

const AdminNavbar = () => {
    return (
        <div className="admin-topbar">
            <div className="search">
                <i className="bi bi-search me-2"></i>
                <input className="form-control form-control-sm" placeholder="Search…" />
            </div>
            <div className="actions">
                <i className="bi bi-bell me-3"></i>
                <div className="avatar">MG</div>
            </div>
        </div>
    );
};
export default AdminNavbar;
