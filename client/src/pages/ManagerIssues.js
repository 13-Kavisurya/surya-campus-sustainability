import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ManagerIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const { user } = useAuth();
    
    // Edit Issue State
    const [editingIssue, setEditingIssue] = useState(null);
    const [editFormData, setEditFormData] = useState({ resourceType: '', location: '', issueType: '', description: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchIssues();
    }, [filter]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const url = filter === 'All' ? '/issues' : `/issues?resourceType=${filter}`;
            const { data } = await api.get(url);
            setIssues(data);
        } catch (err) {
            console.error('Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        let savingsEstimation = {};

        if (status === 'Resolved') {
            const monthlyReduction = prompt('Enter monthly consumption reduction (units):', '300');
            const overusage = prompt('Enter overusage percentage before fix (%):', '15');

            if (monthlyReduction !== null && overusage !== null) {
                savingsEstimation = {
                    monthlyReduction: Number(monthlyReduction),
                    overusage: Number(overusage),
                    monthly: Number(monthlyReduction) // Keep compatibility with existing overview
                };
            } else {
                return; // Cancel resolution if data not provided
            }
        }

        try {
            await api.put(`/issues/${id}`, { status, savingsEstimation });
            fetchIssues();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDeleteIssue = async (id) => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            await api.delete(`/issues/${id}`);
            fetchIssues();
        } catch (err) {
            alert('Failed to delete issue');
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

    const handleUpdateIssueDetails = async (e) => {
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
            default: return 'bi-exclamation-circle-fill text-success';
        }
    };

    return (
        <>
            <div className="d-flex flex-column flex-md-row md:align-items-center justify-content-between gap-4 mb-5">
                <div>
                    <h1 className="display-font fw-bold text-dark mb-1">Resource Incidents</h1>
                    <p className="text-muted mb-0">Track and manage campus resource anomalies and infrastructure issues.</p>
                </div>
                
                <div className="bg-white border rounded px-3 py-2 d-flex align-items-center gap-2 shadow-sm" style={{ minWidth: '200px' }}>
                    <i className="bi bi-funnel-fill text-success"></i>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="form-select border-0 shadow-none fw-bold text-dark p-0 flex-grow-1 cursor-pointer bg-transparent"
                    >
                        <option value="All">All Resources</option>
                        <option value="Water">Water</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Waste">Waste</option>
                        <option value="Transport">Transport</option>
                    </select>
                </div>
            </div>
            
            {/* Edit Issue Modal */}
            {editingIssue && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3" style={{ backdropFilter: 'blur(4px)' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-eco p-4 p-md-5 w-100 mx-3 shadow-lg" style={{ maxWidth: '600px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h4 className="fw-bold text-dark mb-0">Edit Report Details</h4>
                            <button onClick={() => setEditingIssue(null)} className="btn-close shadow-none"></button>
                        </div>
                        <form onSubmit={handleUpdateIssueDetails} className="d-flex flex-column gap-3">
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

            <div className="row g-4 mb-5 position-relative z-1">
                {loading ? (
                    <div className="col-12 py-5 text-center">
                        <div className="spinner-border text-success mb-3" role="status"></div>
                        <p className="text-muted fw-bold text-uppercase small animate-pulse" style={{ letterSpacing: '2px' }}>Loading pending tasks...</p>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="col-12">
                        <div className="card-eco p-5 text-center d-flex flex-column align-items-center justify-content-center border border-dashed text-muted">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3 border shadow-sm" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-check2-circle fs-2 text-success"></i>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">No Active Incidents</h5>
                            <p className="mb-0">There are no operational anomalies reported for {filter}.</p>
                        </div>
                    </div>
                ) : (
                    issues.map((issue, idx) => (
                        <div className="col-12 col-md-6 col-xl-4" key={issue._id}>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="card-eco h-100 p-4 d-flex flex-column hover-lift"
                            >
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <span className="badge bg-light border text-dark fw-bold d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                        <i className={`bi ${getIcon(issue.resourceType)} fs-6`}></i>
                                        {issue.resourceType}
                                    </span>
                                    
                                    <div className="d-flex align-items-center gap-2">
                                        <div className={`rounded-circle border shadow-sm ${
                                            issue.status === 'Resolved' ? 'bg-success border-success text-white' :
                                            issue.status === 'In Progress' ? 'bg-warning border-warning text-dark' : 
                                            'bg-secondary border-secondary text-white'
                                        }`} style={{ width: '12px', height: '12px' }} title={issue.status}></div>
                                        
                                        <button
                                            onClick={() => handleEditIssue(issue)}
                                            className="btn btn-sm btn-outline-primary border-0 p-1 lh-1 ms-1"
                                            title="Edit Details"
                                        >
                                            <i className="bi bi-pencil-fill fs-6"></i>
                                        </button>
                                        
                                        {user?.role === 'admin' && (
                                            <button
                                                onClick={() => handleDeleteIssue(issue._id)}
                                                className="btn btn-sm btn-outline-danger border-0 p-1 lh-1 ms-1"
                                                title="Delete Incident"
                                            >
                                                <i className="bi bi-trash-fill fs-6"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h5 className="fw-bold text-dark mb-2">{issue.issueType}</h5>
                                <p className="text-muted fw-bold small d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-geo-alt-fill text-success opacity-75"></i> {issue.location}
                                </p>
                                
                                <div className="bg-light p-3 rounded border mb-4 flex-grow-1 text-secondary fst-italic small">
                                    "{issue.description}"
                                </div>

                                <div className="mt-auto border-top pt-3">
                                    {issue.status !== 'Resolved' ? (
                                        <div className="d-flex gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(issue._id, 'In Progress')}
                                                className="btn btn-light border shadow-sm flex-grow-1 text-uppercase fw-bold text-muted text-nowrap px-2"
                                                style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                                                disabled={issue.status === 'In Progress'}
                                            >
                                                <i className="bi bi-gear-fill me-1"></i> Start Work
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(issue._id, 'Resolved')}
                                                className="btn btn-eco-primary flex-grow-1 shadow-sm text-uppercase fw-bold text-nowrap px-2"
                                                style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                                            >
                                                <i className="bi bi-check2-all me-1"></i> Resolve
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-2">
                                            <div className="badge bg-success bg-opacity-10 border border-success border-opacity-25 text-success py-2 px-3 fw-bold d-flex align-items-center gap-2 justify-content-start flex-wrap">
                                                <i className="bi bi-arrow-down-circle-fill"></i>
                                                <span>Saved: <strong className="text-dark ms-1">{issue.savingsEstimation?.monthlyReduction}</strong> units/mo</span>
                                            </div>
                                            <div className="badge bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning py-2 px-3 fw-bold d-flex align-items-center gap-2 justify-content-start flex-wrap">
                                                <i className="bi bi-exclamation-triangle-fill"></i>
                                                <span>Overusage: <strong className="text-dark ms-1">{issue.savingsEstimation?.overusage}%</strong></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default ManagerIssues;

