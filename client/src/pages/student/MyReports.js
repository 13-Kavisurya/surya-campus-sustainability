import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6); // 6 per page for card layout
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState(-1);

    const fetchMyReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reports', {
                params: { 
                    page, 
                    limit,
                    search: searchTerm,
                    sortBy,
                    sortOrder
                }
            });
            setReports(res.data.reports);
            setTotalPages(res.data.totalPages);
            setTotalCount(res.data.totalCount);
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyReports();
    }, [page, limit, searchTerm, sortBy, sortOrder]);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Pending Review</span>;
            case 'approved': return <span className="badge bg-primary px-3 py-2 rounded-pill">Approved / Assigned</span>;
            case 'resolved': return <span className="badge bg-success px-3 py-2 rounded-pill">Resolved</span>;
            case 'rejected': return <span className="badge bg-danger px-3 py-2 rounded-pill">Rejected</span>;
            default: return <span className="badge bg-secondary px-3 py-2 rounded-pill">{status}</span>;
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'waste': return 'bi-trash text-danger';
            case 'water': return 'bi-droplet text-info';
            case 'energy': return 'bi-lightning text-warning';
            case 'suggestion': return 'bi-lightbulb text-success';
            default: return 'bi-file-earmark text-secondary';
        }
    };

    return (
        <>
            <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h2 className="display-font fw-bold text-dark mb-1">My Reports</h2>
                    <p className="text-muted mb-0">Track the status of your submitted sustainability issues.</p>
                </div>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                    <div className="position-relative" style={{ width: '250px' }}>
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input 
                            type="text" 
                            className="form-control ps-5 bg-white border-0 shadow-sm rounded-pill py-2" 
                            placeholder="Search my reports..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <select 
                        className="form-select border-0 shadow-sm rounded-pill py-2 px-3 fw-bold text-muted"
                        style={{ width: '160px' }}
                        value={`${sortBy}:${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split(':');
                            setSortBy(field);
                            setSortOrder(parseInt(order));
                            setPage(1);
                        }}
                    >
                        <option value="created_at:-1">Newest First</option>
                        <option value="created_at:1">Oldest First</option>
                        <option value="title:1">Title A-Z</option>
                        <option value="status:1">Status</option>
                    </select>
                    <a href="/student/report" className="btn btn-success fw-bold rounded-pill px-4 shadow-sm py-2">
                        <i className="bi bi-plus-lg me-2"></i>New Report
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : reports.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border-0">
                    <div className="text-muted fs-1 mb-3"><i className="bi bi-inbox"></i></div>
                    <h5>No reports submitted yet</h5>
                    <p className="text-muted">When you report an issue, it will appear here.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {reports.map((report, idx) => (
                        <div className="col-md-6 col-lg-4" key={report._id}>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="card border-0 shadow-sm h-100 feature-card overflow-hidden"
                            >
                                <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className={`bi ${getTypeIcon(report.report_type)} fs-5`}></i>
                                        <span className="fw-bold text-uppercase small text-muted">{report.report_type}</span>
                                    </div>
                                    {getStatusBadge(report.status)}
                                </div>
                                <div className="card-body">
                                    <h5 className="fw-bold text-dark mb-2">{report.title}</h5>
                                    <p className="text-muted small mb-3 line-clamp-2">{report.description}</p>
                                    <div className="d-flex align-items-center text-secondary small">
                                        <i className="bi bi-geo-alt me-2"></i>
                                        {report.location}
                                    </div>
                                </div>
                                <div className="card-footer bg-light border-0 py-3 text-muted small d-flex justify-content-between align-items-center">
                                    <span>Submitted: {new Date(report.created_at).toLocaleDateString()}</span>
                                    {report.resolvedBy && (
                                        <span className="d-flex align-items-center gap-1">
                                            <i className="bi bi-person-check-fill text-success"></i>
                                            {report.resolvedBy.name || 'Coordinator'}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalCount > 0 && !loading && (
                <div className="d-flex justify-content-between align-items-center mt-5 mb-4 bg-white p-3 rounded-4 shadow-sm border">
                    <div className="text-muted small fw-bold">
                        Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} reports
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                        <select 
                            className="form-select form-select-sm border-0 bg-light rounded-pill px-3 fw-bold"
                            value={limit}
                            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                            style={{ width: '80px' }}
                        >
                            <option value="6">6</option>
                            <option value="12">12</option>
                            <option value="24">24</option>
                        </select>

                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 bg-light rounded-pill px-3 text-dark fw-bold" onClick={() => setPage(page - 1)}>Prev</button>
                                </li>
                                
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                        return (
                                            <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                                <button 
                                                    className={`page-link border-0 rounded-circle fw-bold ${page === p ? 'btn-success text-white' : 'bg-light text-dark'}`} 
                                                    style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setPage(p)}
                                                >
                                                    {p}
                                                </button>
                                            </li>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <li key={p} className="page-item disabled px-1 text-muted">...</li>;
                                    }
                                    return null;
                                })}

                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 bg-light rounded-pill px-3 text-dark fw-bold" onClick={() => setPage(page + 1)}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyReports;

