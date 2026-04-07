import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiTrash2, FiActivity, FiSettings, FiDatabase, FiLogOut, FiUserPlus } from 'react-icons/fi';



const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/analytics');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <p className="text-muted small fw-bold text-uppercase">Synchronizing Data...</p>
        </div>
    );

    const statCards = [
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'primary' },
        { title: 'Total Reports', value: stats?.totalReports || 0, icon: FiFileText, color: 'success' },
        { title: 'Waste Reports', value: stats?.wasteReports || 0, icon: FiTrash2, color: 'danger' },
        { title: 'Energy Reports', value: stats?.energyReports || 0, icon: FiActivity, color: 'warning' },
        { title: 'Water Reports', value: stats?.waterReports || 0, icon: FiActivity, color: 'info' }
    ];

    return (
        <div className="admin-content-fade">
            <header className="mb-5">
                <h1 className="h3 fw-bold text-dark display-font mb-2">Platform Analytics</h1>
                <p className="text-muted">Real-time oversight of the campus sustainability network.</p>
            </header>

            <div className="row g-4 mb-5">
                {statCards.map((stat, index) => (
                    <div key={index} className="col-12 col-md-6 col-lg-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card-eco p-4 border-0 h-100 position-relative overflow-hidden"
                            style={{ borderTop: `4px solid var(--bs-${stat.color})` }}
                        >
                            <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                <stat.icon size={80} />
                            </div>
                            <h3 className="h6 text-muted text-uppercase fw-bold mb-3" style={{ letterSpacing: '0.5px' }}>{stat.title}</h3>
                            <div className="display-5 fw-bold text-dark mb-0">{stat.value}</div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card-eco p-4 border-0 h-100">
                        <h5 className="fw-bold mb-4">System Activity Summary</h5>
                        <div className="p-5 text-center text-muted bg-light rounded-4 border border-dashed">
                             Activity visualization will populate as live data streams in.
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card-eco p-4 border-0 h-100">
                        <h5 className="fw-bold mb-4">Administrative Tasks</h5>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item bg-transparent px-0 py-3 border-bottom d-flex align-items-center gap-3">
                                <div className="bg-success-light text-success p-2 rounded-3"><FiSettings /></div>
                                <div>
                                    <p className="mb-0 fw-bold small">Audit Logs</p>
                                    <small className="text-muted">Review system changes</small>
                                </div>
                            </li>
                            <li className="list-group-item bg-transparent px-0 py-3 border-bottom d-flex align-items-center gap-3">
                                <div className="bg-primary-light text-primary p-2 rounded-3"><FiDatabase /></div>
                                <div>
                                    <p className="mb-0 fw-bold small">Backup DB</p>
                                    <small className="text-muted">Generate maintenance snapshot</small>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
