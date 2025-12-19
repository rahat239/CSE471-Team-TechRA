import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/Logo.svg';
import UserSubmitButton from "../user/UserSubmitButton";
import CartStore from "../../store/CartStore";
import WishStore from "../../store/WishStore";

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
            str.split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2,'0')).join('')
        );
        return JSON.parse(json);
    } catch (e) {
        console.debug('[Navbar] JWT parse failed', e);
        return null;
    }
}

const AppNavBar = () => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const navigate = useNavigate();

    const CartCount = CartStore((state) => state.CartCount || 0);
    const WishCount = WishStore((state) => state.WishCount || 0);

    const token = localStorage.getItem('token') || getCookie('token') || '';
    const isLoggedIn = !!token;

    const isAdmin = useMemo(() => {
        if (!token) return false;
        const p = parseJwt(token);
        const email = (p?.email || '').toLowerCase();
        const role = p?.role;
        return role === 'admin' || email === 'rahatahmed537@gmail.com';
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'token=; Max-Age=0; path=/';
        navigate('/login');
    };

    return (
        <>
            {/* Top Strip */}
            <div className="container-fluid text-white p-2 bg-success">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-md-6 d-flex align-items-center gap-3">
                            <span className="fs-6"><i className="bi bi-envelope"></i> Support@TechRA.com</span>
                            <span className="fs-6"><i className="bi bi-telephone"></i> 01791932587</span>
                        </div>
                        <div className="col-md-6 d-flex justify-content-end align-items-center gap-3">
                            <i className="bi bi-whatsapp"></i>
                            <i className="bi bi-youtube"></i>
                            <i className="bi bi-facebook"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className="navbar sticky-top shadow-sm bg-white navbar-expand-lg navbar-light py-3">
                <div className="container d-flex align-items-center justify-content-between flex-wrap">

                    {/* Left Side: Logo + Buttons */}
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        {/* Logo */}
                        <Link className="navbar-brand d-flex align-items-center me-3" to="/">
                            <img src={logo} alt="Logo" width={120} />
                        </Link>

                        {/* Navbar Buttons */}
                        <Link className="btn btn-light d-flex align-items-center me-2" to="/">
                            <i className="bi bi-house me-1"></i> Home
                        </Link>
                        <Link className="btn position-relative btn-light d-flex align-items-center me-2" to="/cart">
                            <i className="bi bi-bag me-1"></i> Cart
                            <span className="badge bg-success rounded-pill position-absolute top-0 start-100 translate-middle">
                                {CartCount}
                            </span>
                        </Link>
                        <Link className="btn position-relative btn-light d-flex align-items-center me-2" to="/wish">
                            <i className="bi bi-heart me-1"></i> Wish
                            <span className="badge bg-warning rounded-pill position-absolute top-0 start-100 translate-middle">
                                {WishCount}
                            </span>
                        </Link>
                        <Link className="btn btn-light d-flex align-items-center me-2" to="/orders">
                            <i className="bi bi-truck me-1"></i> Order
                        </Link>
                        <Link className="btn btn-light d-flex align-items-center me-2" to="/pc-builder">
                            <i className="bi bi-cpu me-1"></i> PC Builder
                        </Link>
                        <Link className="btn btn-light d-flex align-items-center me-2" to="/ai-recommendation">
                            <i className="bi bi-cpu me-1"></i> AI Suggestion
                        </Link>
                    </div>

                    {/* Right Side: Search + Auth */}
                    <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end mt-2 mt-lg-0">
                        <div className="input-group" style={{ minWidth: '250px', maxWidth: '400px' }}>
                            <input
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="form-control"
                                type="search"
                                placeholder="Search..."
                                aria-label="Search"
                            />
                            <Link
                                to={searchKeyword.length > 0 ? `/by-keyword/${searchKeyword}` : `/`}
                                className="btn btn-outline-dark d-flex align-items-center"
                            >
                                <i className="bi bi-search"></i>
                            </Link>
                        </div>

                        {isLoggedIn ? (
                            <>
                                <UserSubmitButton
                                    onClick={handleLogout}
                                    text="Logout"
                                    className="btn btn-success d-flex align-items-center"
                                />
                                <Link className="btn btn-success d-flex align-items-center" to="/profile">
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link className="btn btn-success d-flex align-items-center" to="/admin/dashboard">
                                        Admin Dashboard
                                    </Link>
                                )}
                            </>
                        ) : (
                            <Link className="btn btn-success d-flex align-items-center" to="/login">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default AppNavBar;