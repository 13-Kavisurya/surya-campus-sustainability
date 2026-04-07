import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';

const ApproveReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingReports();
    }, []);

    const fetchPendingReports = async () => {
        try {
            const res = await api.get('/reports?status=pending');
            setReports(res.data.reports || []);
        } catch (error) {
            console.error("Failed to fetch pending reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const res = await api.put(`/reports/${id}`, { status: 'approved' });
            setReports(reports.filter(r => r._id !== id));
        } catch (error) {
            console.error("Failed to approve report", error);
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await api.put(`/reports/${id}`, { status: 'rejected' });
            setReports(reports.filter(r => r._id !== id));
        } catch (error) {
            console.error("Failed to reject report", error);
        }
    };

    return (
        <>
            <div className="mb-4">
                <h2 className="display-font fw-bold text-dark mb-1">Approve Reports</h2>
                <p className="text-muted mb-0">Action pending sustainability reports.</p>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : reports.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border-0">
                    <div className="text-success fs-1 mb-3"><i className="bi bi-check-circle"></i></div>
                    <h5>All caught up!</h5>
                    <p className="text-muted">There are no pending reports to approve.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {reports.map((report, idx) => (
                        <div className="col-12" key={report._id}>
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="card border-0 shadow-sm feature-card p-3 d-flex flex-md-row justify-content-between align-items-center gap-3"
                            >
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="badge bg-warning text-dark px-2 rounded-pill">Pending Review</span>
                                        <span className="text-uppercase small fw-bold text-muted">{report.report_type}</span>
                                    </div>
                                    <h5 className="fw-bold mb-1 text-dark">{report.title}</h5>
                                    <p className="text-muted small mb-1">{report.description}</p>
                                    <div className="text-muted small"><i className="bi bi-geo-alt me-1"></i>{report.location}</div>
                                </div>
                                
                                <div className="d-flex gap-2">
                                    <button onClick={() => handleApprove(report._id)} className="btn btn-success fw-bold px-4 rounded-pill shadow-sm">
                                        <i className="bi bi-check-lg me-2"></i>Approve
                                    </button>
                                    <button onClick={() => handleReject(report._id)} className="btn btn-outline-danger fw-bold px-4 rounded-pill">
                                        <i className="bi bi-x-lg me-2"></i>Reject
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default ApproveReports;

