import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from '../../components/UI/Skeleton';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports');
                setReports(res.data.reports || []);
            } catch (error) {
                toast.error("Failed to sync dashboard data.");
                console.error("Failed to fetch reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const pendingCount = reports.filter(r => r.status === 'pending').length;
    const resolvedCount = reports.filter(r => r.status === 'resolved').length;

    return (
        <div className="fade-in-up">
            <div className="mb-4 d-flex justify-content-between align-items-end">
                <div>
                    <h2 className="display-font fw-bold text-dark mb-1" style={{ fontSize: '1.5rem' }}>Staff Dashboard</h2>
                    <p className="text-secondary text-small mb-0">Overview of campus sustainability operations.</p>
                </div>
                <div className="text-end d-none d-md-block">
                    <span className="text-xs-caps d-block">Status</span>
                    <span className="text-success fw-bold text-small d-flex align-items-center gap-1">
                        <div className="bg-success rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                        Operational
                    </span>
                </div>
            </div>

            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    <div className="row g-3 mb-4">
                        {[
                            { label: 'Pending', count: pendingCount, icon: 'bi-clock-history', bg: 'warning' },
                            { label: 'Resolved', count: resolvedCount, icon: 'bi-check2-all', bg: 'success' },
                            { label: 'Tasks', count: 12, icon: 'bi-list-task', bg: 'primary' },
                            { label: 'Total', count: reports.length, icon: 'bi-graph-up', bg: 'info' }
                        ].map((stat, idx) => (
                            <div className="col-6 col-md-3" key={idx}>
                                <motion.div 
                                    whileHover={{ y: -3 }}
                                    className="glass-card p-3 border-0 shadow-sm h-100"
                                >
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <div className={`bg-${stat.bg}-light text-${stat.bg} rounded-3 p-2 d-flex align-items-center justify-content-center`} style={{ width: '32px', height: '32px' }}>
                                            <i className={`bi ${stat.icon} fs-6`}></i>
                                        </div>
                                        <span className="text-xs-caps">{stat.label}</span>
                                    </div>
                                    <h4 className="fw-bold mb-0">{stat.count}</h4>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-3">
                        <div className="col-lg-8">
                            <div className="glass-card border-0 shadow-sm p-4 h-100">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h6 className="fw-bold mb-0 text-dark">Recent Pending Issues</h6>
                                    <a href="/staff/manage-reports" className="text-success text-small fw-bold text-decoration-none">View All</a>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th className="text-xs-caps border-0 ps-0">Issue</th>
                                                <th className="text-xs-caps border-0">Location</th>
                                                <th className="text-xs-caps border-0 text-end pe-0">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-0">
                                            {reports.filter(r => r.status === 'pending').slice(0, 5).map(report => (
                                                <tr key={report._id} className="border-bottom-light">
                                                    <td className="ps-0 py-3">
                                                        <div className="fw-bold text-dark text-small">{report.title}</div>
                                                        <div className="text-xs-caps" style={{ opacity: 0.5 }}>#{report._id.slice(-6)}</div>
                                                    </td>
                                                    <td className="text-secondary text-small py-3">{report.location}</td>
                                                    <td className="text-secondary text-small text-end pe-0 py-3">
                                                        {new Date(report.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            {pendingCount === 0 && (
                                                <tr><td colSpan="3" className="text-center text-muted py-5 text-small italic">No pending issues currently.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="glass-card border-0 shadow-sm p-4 h-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, var(--eco-primary) 0%, #059669 100%)' }}>
                                <h6 className="fw-bold mb-4 text-white">Quick Actions</h6>
                                <div className="d-flex flex-column gap-2 mt-auto">
                                    <a href="/staff/manage-reports" className="btn btn-light hover-lift d-flex align-items-center justify-content-between p-3 border-0 shadow-sm rounded-3">
                                        <span className="fw-bold text-small">Manage Reports</span>
                                        <i className="bi bi-arrow-right-short fs-4"></i>
                                    </a>
                                    <a href="/staff/analytics" className="btn btn-white bg-white/10 text-white hover-lift d-flex align-items-center justify-content-between p-3 border-0 shadow-sm rounded-3">
                                        <span className="fw-bold text-small">View Analytics</span>
                                        <i className="bi bi-graph-up-arrow fs-6"></i>
                                    </a>
                                    <a href="/staff/add-usage" className="btn btn-white bg-white/10 text-white hover-lift d-flex align-items-center justify-content-between p-3 border-0 shadow-sm rounded-3">
                                        <span className="fw-bold text-small">Log New Usage</span>
                                        <i className="bi bi-plus-lg fs-6"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StaffDashboard;

