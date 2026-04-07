import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    // Edit Issue State
    const [editingIssue, setEditingIssue] = useState(null);
    const [editFormData, setEditFormData] = useState({ resourceType: '', location: '', issueType: '', description: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/issues');
            setIssues(data);
        } catch (err) {
            console.error('Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const handleEditIssue = (issue) => {
        setEditingIssue(issue);
        setEditFormData({
            resourceType: issue.resourceType,
            location: issue.location,
            issueType: issue.issueType,
            description: issue.description
        });
    };

    const handleUpdateIssue = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await api.put(`/issues/${editingIssue._id}`, editFormData);
            setEditingIssue(null);
            fetchIssues();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update issue');
        } finally {
            setIsUpdating(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Water': return 'bi-droplet-fill text-info';
            case 'Electricity': return 'bi-lightning-fill text-warning';
            case 'Waste': return 'bi-trash-fill text-danger';
            case 'Transport': return 'bi-bus-front-fill text-primary';
            default: return 'bi-exclamation-circle-fill text-secondary';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Resolved':
                return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1"><i className="bi bi-check-circle-fill"></i> Resolved</span>;
            case 'In Progress':
                return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1"><i className="bi bi-gear-fill"></i> In Progress</span>;
            default:
                return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1"><i className="bi bi-clock-fill"></i> Pending</span>;
        }
    };

    const filteredIssues = filter === 'all' ? issues : 
        filter === 'pending' ? issues.filter(i => i.status !== 'Resolved') :
        issues.filter(i => i.status === 'Resolved');

    const stats = [
        { label: 'Total Reports', val: issues.length, icon: 'bi-exclamation-circle', colorClass: 'text-primary', bgClass: 'bg-primary' },
        { label: 'Pending Action', val: issues.filter(i => i.status !== 'Resolved').length, icon: 'bi-clock-history', colorClass: 'text-warning', bgClass: 'bg-warning' },
        { label: 'Resolved', val: issues.filter(i => i.status === 'Resolved').length, icon: 'bi-check2-circle', colorClass: 'text-success', bgClass: 'bg-success' }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <>
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4"
            >
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="bg-success rounded-circle animate-pulse shadow-sm" style={{ width: '8px', height: '8px' }}></div>
                        <span className="text-success fw-bold text-uppercase small" style={{ letterSpacing: '2px', fontSize: '0.7rem' }}>Eco-Reporting Hub</span>
                    </div>
                    <h1 className="display-font fw-bold text-dark mb-2">Your Impact</h1>
                    <p className="text-muted mb-0" style={{ maxWidth: '600px' }}>Track and manage your campus sustainability reports. Every issue reported brings us closer to a greener campus ecosystem.</p>
                </div>
                <motion.button
                    onClick={() => navigate('/student/report')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-eco-primary py-3 px-4 shadow-sm text-uppercase fw-bold d-flex align-items-center gap-2 text-nowrap"
                    style={{ letterSpacing: '1px' }}
                >
                    <i className="bi bi-plus-lg"></i> Submit Report
                </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="row g-4 mb-5"
            >
                {stats.map((stat, idx) => (
                    <div className="col-12 col-md-4" key={stat.label}>
                        <motion.div variants={itemVariants} className="card-eco p-4 h-100 hover-lift">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className={`${stat.bgClass} bg-opacity-10 rounded d-flex align-items-center justify-content-center border ${stat.borderClass} border-opacity-25`} style={{ width: '48px', height: '48px' }}>
                                    <i className={`bi ${stat.icon} fs-4 ${stat.colorClass}`}></i>
                                </div>
                                <i className={`bi bi-graph-up-arrow opacity-50 ${stat.colorClass}`}></i>
                            </div>
                            <h2 className={`display-5 fw-bolder mb-1 ${stat.colorClass}`}>{stat.val}</h2>
                            <p className="text-muted fw-bold text-uppercase mb-0" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{stat.label}</p>
                        </motion.div>
                    </div>
                ))}
            </motion.div>

            {/* Edit Issue Modal */}
            {editingIssue && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3" style={{ backdropFilter: 'blur(4px)' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-eco p-4 p-md-5 w-100 mx-3 shadow-lg" style={{ maxWidth: '600px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h4 className="fw-bold text-dark mb-0">Edit Report Details</h4>
                            <button onClick={() => setEditingIssue(null)} className="btn-close shadow-none"></button>
                        </div>
                        <form onSubmit={handleUpdateIssue} className="d-flex flex-column gap-3">
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Resource</label>
                                    <select
                                        className="form-select form-control-eco bg-light"
                                        value={editFormData.resourceType}
                                        onChange={(e) => setEditFormData({ ...editFormData, resourceType: e.target.value })}
                                        required
                                    >
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Waste">Waste</option>
                                        <option value="Transport">Transport</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Issue Type</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-eco bg-light"
                                        value={editFormData.issueType}
                                        onChange={(e) => setEditFormData({ ...editFormData, issueType: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Location</label>
                                <input
                                    type="text"
                                    className="form-control form-control-eco bg-light"
                                    value={editFormData.location}
                                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Description</label>
                                <textarea
                                    className="form-control form-control-eco bg-light"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    required
                                    rows="3"
                                />
                            </div>
                            <div className="d-flex gap-2 mt-4">
                                <button type="button" onClick={() => setEditingIssue(null)} className="btn btn-light fw-bold flex-grow-1 border shadow-sm">Cancel</button>
                                <button type="submit" disabled={isUpdating} className="btn btn-eco-primary fw-bold flex-grow-1 shadow-sm">
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Filter & Reports Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="card-eco p-4 p-md-5 position-relative z-1"
            >
                {/* Header with Filter */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 border-bottom pb-4 mb-4">
                    <div>
                        <h4 className="fw-bold text-dark mb-1">Recent Reports</h4>
                        <p className="text-muted small mb-0">Monitor all your submitted sustainability issues</p>
                    </div>
                    
                    <div className="bg-light p-1 rounded d-flex gap-1 border shadow-sm">
                        {['all', 'pending', 'resolved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`btn btn-sm ${
                                    filter === f 
                                        ? 'btn-white text-dark shadow-sm bg-white' 
                                        : 'btn-light text-muted border-0 hover:bg-white'
                                } text-capitalize fw-bold px-3 py-2`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Issues List */}
                {loading ? (
                    <div className="py-5 text-center">
                        <div className="spinner-border text-success mb-3" role="status"></div>
                        <p className="text-muted fw-bold text-uppercase small animate-pulse" style={{ letterSpacing: '2px' }}>Loading reports...</p>
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <div className="py-5 text-center px-3 border border-dashed rounded bg-light bg-opacity-50">
                        <div className="bg-white rounded-circle shadow-sm border p-3 d-inline-block mb-3">
                            <i className="bi bi-clipboard2-x opacity-50 text-secondary fs-1"></i>
                        </div>
                        <h5 className="fw-bold text-dark mb-1">No reports found</h5>
                        <p className="text-muted">Start by submitting your first sustainability issue.</p>
                        {filter !== 'all' && (
                            <button onClick={() => setFilter('all')} className="btn btn-link text-success fw-bold text-decoration-none mt-2">View All Reports</button>
                        )}
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {filteredIssues.map((issue, idx) => (
                            <motion.div
                                key={issue._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border rounded p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 shadow-sm hover-lift"
                            >
                                <div className="d-flex align-items-start gap-4 flex-grow-1">
                                    <div className="bg-light rounded p-3 text-center border shadow-sm d-none d-sm-block">
                                        <i className={`bi ${getIcon(issue.resourceType)} fs-3`}></i>
                                    </div>
                                    <div>
                                        <div className="d-flex flex-wrap align-items-center gap-2 gap-sm-3 mb-2">
                                            <h5 className="fw-bold text-dark mb-0">{issue.resourceType}</h5>
                                            <span className="badge bg-light border text-dark fw-normal rounded-pill px-3 py-1 shadow-sm">{issue.issueType}</span>
                                        </div>
                                        <div className="d-flex flex-wrap align-items-center gap-3 text-muted fw-bold text-uppercase small" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                            <span className="d-flex align-items-center gap-1">
                                                <i className="bi bi-geo-alt-fill text-success opacity-75"></i> {issue.location}
                                            </span>
                                            <span className="d-flex align-items-center gap-1">
                                                <i className="bi bi-calendar3 opacity-75"></i> {new Date(issue.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3 justify-content-end align-self-md-center">
                                    {getStatusBadge(issue.status)}
                                    {issue.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleEditIssue(issue)}
                                            className="btn btn-sm btn-outline-primary border shadow-sm"
                                            title="Edit Issue"
                                        >
                                            <i className="bi bi-pencil-fill"></i>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default StudentDashboard;

