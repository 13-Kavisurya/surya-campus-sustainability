import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const ManagerDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/usage/analytics');
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Water': return 'bi-droplet-fill text-info';
            case 'Electricity': return 'bi-lightning-fill text-warning';
            case 'Waste': return 'bi-trash-fill text-danger';
            case 'Transport': return 'bi-bus-front-fill text-primary';
            default: return 'bi-activity text-success';
        }
    };

    if (loading) {
        return (
            <>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="text-muted fw-bold text-uppercase d-flex align-items-center gap-3 animate-pulse" style={{ letterSpacing: '2px' }}>
                        <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                        Loading Dashboard Analytics...
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="d-flex flex-column flex-md-row md:align-items-center justify-content-between gap-3 mb-5">
                <div>
                    <h1 className="display-font fw-bold text-dark mb-1">Manager Overview</h1>
                    <p className="text-muted mb-0">Manage and monitor campus sustainability performance.</p>
                </div>
                <div className="d-flex gap-3 align-items-center">
                    <div className="bg-white border rounded-pill px-4 py-2 text-muted fw-bold text-uppercase shadow-sm d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                        <i className="bi bi-activity text-success"></i> Live Platform Stats
                    </div>
                </div>
            </div>

            {/* Top Stats */}
            <div className="row mb-5">
                <div className="col-12 col-md-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-eco p-4 p-lg-5 text-center d-flex flex-column align-items-center h-100"
                    >
                        <div className="bg-success bg-opacity-10 rounded-circle text-success fs-3 d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                            <i className="bi bi-bar-chart-fill"></i>
                        </div>
                        <h6 className="text-muted fw-bold text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>Sustainability Index</h6>
                        <h1 className="display-4 fw-bolder text-dark mb-3">{analytics?.overallIndex}%</h1>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1">
                            <i className="bi bi-graph-up-arrow"></i> +2.4% from last month
                        </span>
                    </motion.div>
                </div>
            </div>

            <h6 className="text-muted fw-bold text-uppercase mb-4 ps-2" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>Resource Performance</h6>
            <div className="row g-4 mb-5">
                {analytics?.resourceScores && Object.entries(analytics.resourceScores).map(([resource, score], idx) => (
                    <div className="col-12 col-md-6 col-xl-3" key={resource}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`card border-0 shadow-sm h-100 p-4 border-bottom border-4 ${
                                score > 70 ? 'border-success' : score > 40 ? 'border-warning' : 'border-danger'
                            } hover-lift`}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="bg-light border rounded p-3">
                                    <i className={`bi ${getIcon(resource)} fs-4`}></i>
                                </div>
                                <h3 className="fw-bolder text-dark mb-0">{score}%</h3>
                            </div>
                            <h6 className="fw-bold text-dark mb-3">{resource}</h6>
                            <div className="progress" style={{ height: '6px' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                    className={`progress-bar ${score > 70 ? 'bg-success' : score > 40 ? 'bg-warning' : 'bg-danger'}`}
                                />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-12 col-xl-8">
                    <div className="card-eco p-4 h-100">
                        <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                            <i className="bi bi-graph-up-arrow text-success"></i> Savings Optimization
                        </h5>
                        <div className="d-flex flex-column gap-3">
                            {analytics?.savingsData?.length > 0 ? (
                                analytics.savingsData.map((item, idx) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-light border rounded px-4 py-3 d-flex justify-content-between align-items-center hover-lift"
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-success rounded-pill" style={{ width: '6px', height: '32px' }}></div>
                                            <span className="fw-bold text-dark">{item._id} Optimization</span>
                                        </div>
                                        <h5 className="fw-bolder text-success mb-0">+${item.totalMonthlySavings}/mo</h5>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-5 text-muted fst-italic">
                                    No savings data logged yet. Resolve issues to see estimations.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-4">
                    <div className="card text-center d-flex flex-column align-items-center justify-content-center h-100 bg-transparent py-5" 
                        style={{ border: '2px dashed var(--eco-border)', cursor: 'pointer' }}>
                        <div className="bg-white border text-secondary shadow-sm rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                            <i className="bi bi-plus-lg fs-3"></i>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">Add Resource Widget</h6>
                        <small className="text-muted">Customize your overview dashboard</small>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManagerDashboard;

