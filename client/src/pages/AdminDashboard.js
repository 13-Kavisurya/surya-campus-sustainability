import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/usage/analytics');
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to fetch analytics');
                setError('Unable to load sustainability analytics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getIcon = (res) => {
        switch (res) {
            case 'Water': return 'bi-droplet-fill text-info';
            case 'Electricity': return 'bi-lightning-fill text-warning';
            case 'Waste': return 'bi-trash-fill text-danger';
            case 'Transport': return 'bi-bus-front-fill text-primary';
            default: return 'bi-bar-chart-fill text-success';
        }
    };

    if (loading) {
        return (
            <>
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted fw-bold text-uppercase small" style={{ letterSpacing: '2px' }}>Synchronizing Eco-Data</p>
                </div>
            </>
        );
    }

    if (error || !analytics) {
        return (
            <>
                <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '60vh' }}>
                    <div className="bg-danger bg-opacity-10 p-4 rounded-circle mb-4 text-danger">
                        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h2 className="fw-bold display-font text-dark mb-2">Telemetric Failure</h2>
                    <p className="text-muted">{error || 'No analytics data available.'}</p>
                </div>
            </>
        );
    }

    const pieData = Object.entries(analytics.resourceScores || {}).map(([name, value]) => ({ name, value }));
    const barData = (analytics.savingsData || []).map(item => ({
        name: item._id,
        savings: item.totalMonthlySavings
    }));

    return (
        <>
            <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                        <span className="text-success fw-bold text-uppercase small" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>Live Ecosystem Matrix</span>
                    </div>
                    <h1 className="display-font fw-bold text-dark mb-1">
                        Sustainability <span className="text-success">Nexus</span>
                    </h1>
                    <p className="text-muted mb-0">Real-time cross-sector efficiency metrics and ecological impact analysis</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="bg-white border rounded-3 px-3 py-2 d-flex align-items-center gap-2 shadow-sm text-secondary fw-bold small">
                        <i className="bi bi-calendar3 text-success"></i> Cycle 2026.02
                    </div>
                    <button className="btn btn-success shadow-sm rounded-3">
                        <i className="bi bi-download"></i>
                    </button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Total Efficiency Index */}
                <div className="col-12 col-lg-4">
                    <motion.div className="card-eco hover-lift h-100 p-4 text-center d-flex flex-column align-items-center justify-content-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}>
                        <h6 className="text-muted fw-bold text-uppercase mb-4" style={{ letterSpacing: '2px', fontSize: '0.75rem' }}>Total Efficiency Index</h6>
                        
                        <div className="position-relative mb-4" style={{ width: '160px', height: '160px' }}>
                            <svg viewBox="0 0 36 36" className="w-100 h-100" style={{ transform: 'rotate(-90deg)' }}>
                                <path
                                    className="fill-none"
                                    stroke="var(--eco-border)"
                                    strokeWidth="2.5"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <motion.path
                                    initial={{ strokeDasharray: "0, 100" }}
                                    animate={{ strokeDasharray: `${analytics.overallIndex}, 100` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="fill-none"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    stroke={getScoreColor(analytics.overallIndex)}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center">
                                <h1 className="display-4 fw-bolder text-dark mb-0 lh-1">{analytics.overallIndex}</h1>
                                <small className="text-success fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Net Score</small>
                            </div>
                        </div>

                        <div className={`badge rounded-pill px-3 py-2 ${analytics.overallIndex >= 70 ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                            {analytics.overallIndex >= 70 ? 'Optimal Baseline' : 'Performance Alert'}
                        </div>
                    </motion.div>
                </div>

                {/* Resource Scores */}
                <div className="col-12 col-lg-8">
                    <div className="row g-4">
                        {Object.entries(analytics.resourceScores || {}).map(([res, score], idx) => (
                            <div className="col-12 col-md-6" key={res}>
                                <motion.div 
                                    className="card-eco hover-lift p-4 h-100"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded p-3 d-flex align-items-center justify-content-center shadow-sm">
                                                <i className={`bi ${getIcon(res)} fs-4`}></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0">{res}</h6>
                                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Resource Node</small>
                                            </div>
                                        </div>
                                        <h3 className="fw-bolder text-dark mb-0">{score}%</h3>
                                    </div>
                                    <div className="d-flex justify-content-between text-muted mb-2 small fw-bold">
                                        <span className="text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Sector Resilience</span>
                                        <span className="text-success"><i className="bi bi-arrow-up-right"></i> +2.4%</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px', backgroundColor: 'var(--eco-border)' }}>
                                        <motion.div 
                                            className="progress-bar rounded-pill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1 }}
                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Economic Yield Chart */}
                <div className="col-12 col-lg-7">
                    <div className="card-eco p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                                    <i className="bi bi-bar-chart-line-fill text-success"></i> Economic Yield
                                </h5>
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Resource Savings Analysis</small>
                            </div>
                            <span className="badge bg-light text-success border border-success fw-bold p-2">Optimized Projections</span>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                                    />
                                    <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Focus Allocation */}
                <div className="col-12 col-lg-5">
                    <div className="card-eco p-4 h-100">
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                                <i className="bi bi-pie-chart-fill text-info"></i> Focus Allocation
                            </h5>
                            <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Strategic Sector Weighting</small>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;

