// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { getAdminMetrics } from '../api/admin';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import MetricCard from '../components/MetricCard';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const resp = await getAdminMetrics('30d');
            if (resp?.status !== 'success') {
                navigate('/login');
                return;
            }
            setMetrics(resp.data);
        })();
    }, [navigate]);

    const top5 = useMemo(() => (metrics?.popularProducts || []).slice(0,5), [metrics]);
    const series = useMemo(() => {
        const base = [12, 24, 9, 26, 18, 23, 19, 27];
        const scale = Math.max(1, Math.min(3, Math.round((metrics?.orders || 1)/10)));
        return base.map(n => n*scale);
    }, [metrics]);

    if (!metrics) return <div className="container py-5">Loading...</div>;

    return (
        <div className="admin-shell">
            <aside className="admin-sidenav">
                <AdminSidebar />
            </aside>

            <main className="admin-main">
                <AdminNavbar />

                <div className="container-fluid py-4">
                    <div className="row g-3">
                        <div className="col-12 col-md-4">
                            <MetricCard title="Revenue" value={`৳${(metrics.revenue ?? 0).toLocaleString()}`} icon="bi-cash-coin" accent="accent-purple" subtitle="Last 30 days" />
                        </div>
                        <div className="col-12 col-md-4">
                            <MetricCard title="Orders" value={metrics.orders ?? 0} icon="bi-bag-check" accent="accent-indigo" subtitle="Completed payments" />
                        </div>
                        <div className="col-12 col-md-4">
                            <MetricCard title="Popular Products" value={metrics.popularProducts?.length ?? 0} icon="bi-graph-up-arrow" accent="accent-green" subtitle="Top performers" />
                        </div>
                    </div>

                    <div className="row g-3 mt-1">
                        <div className="col-12 col-lg-8">
                            <div className="card dashboard-card">
                                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                    <h6 className="m-0">Budget vs Sales</h6>
                                    <div className="legend">
                                        <span className="dot dot-primary"></span> Selling Price
                                        <span className="ms-3 dot dot-accent"></span> Budget Price
                                    </div>
                                </div>
                                <div className="card-body">
                                    <svg viewBox="0 0 800 300" className="area-chart">
                                        <g stroke="#eef1f7">
                                            {[0,50,100,150,200,250,300].map(y=>(
                                                <line key={y} x1="0" x2="800" y1={300-y} y2={300-y}/>
                                            ))}
                                        </g>

                                        <polyline
                                            fill="url(#gradPrimary)"
                                            stroke="none"
                                            points={series.map((v,i)=>`${(i/(series.length-1))*800},${300 - v*6}`).join(' ')}
                                        />
                                        <polyline
                                            fill="none"
                                            strokeWidth="3"
                                            className="stroke-primary"
                                            points={series.map((v,i)=>`${(i/(series.length-1))*800},${300 - v*6}`).join(' ')}
                                        />
                                        <polyline
                                            fill="none"
                                            strokeWidth="3"
                                            className="stroke-accent"
                                            points={series.map((v,i)=>`${(i/(series.length-1))*800},${300 - (v*5.4)}`).join(' ')}
                                        />
                                        <defs>
                                            <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--primary-400)" stopOpacity="0.35"/>
                                                <stop offset="100%" stopColor="var(--primary-400)" stopOpacity="0"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="d-flex justify-content-between small text-muted mt-2">
                                        {months.slice(0,8).map(m => <span key={m}>{m}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="card dashboard-card">
                                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                    <h6 className="m-0">Top 5 Products</h6>
                                    <span className="badge rounded-pill bg-light text-dark">Month</span>
                                </div>
                                <div className="list-group list-group-flush">
                                    {top5.length === 0 && <div className="p-3 text-muted">No data</div>}
                                    {top5.map((p, i) => (
                                        <div key={p.productId || i} className="list-group-item d-flex align-items-center">
                                            <div className="rank">{i+1}</div>
                                            <div className="flex-grow-1">
                                                <div className="fw-semibold">{p.name}</div>
                                                <div className="text-muted small">{Math.round(p.qty)} sales</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-semibold">৳{Math.round(p.sales).toLocaleString()}</div>
                                                <div className="progress mini mt-1" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                                                    <div className="progress-bar" style={{width: `${Math.min(100, (p.qty / (top5[0]?.qty || 1)) * 100)}%`}} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
