import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';

const ManageReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState(-1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchReports();
    }, [page, limit, debouncedSearchTerm, sortBy, sortOrder]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reports', {
                params: { 
                    page, 
                    limit,
                    search: debouncedSearchTerm,
                    sortBy,
                    sortOrder
                }
            });
            setReports(res.data.reports);
            setTotalPages(res.data.totalPages);
            setTotalCount(res.data.totalCount);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 1 ? -1 : 1);
        } else {
            setSortBy(field);
            setSortOrder(1);
        }
        setPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <i className="bi bi-chevron-expand ms-1 text-muted small"></i>;
        return sortOrder === 1 
            ? <i className="bi bi-chevron-up ms-1 text-success small"></i> 
            : <i className="bi bi-chevron-down ms-1 text-success small"></i>;
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.put(`/reports/${id}`, { status: newStatus });
            setReports(reports.map(r => r._id === id ? res.data : r));
        } catch (error) {
            console.error("Failed to update report", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await api.delete(`/reports/${id}`);
                setReports(reports.filter(r => r._id !== id));
            } catch (error) {
                console.error("Failed to delete report", error);
            }
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <span className="badge bg-warning text-dark px-2 rounded">Pending</span>;
            case 'approved': return <span className="badge bg-primary px-2 rounded">Approved</span>;
            case 'resolved': return <span className="badge bg-success px-2 rounded">Resolved</span>;
            case 'rejected': return <span className="badge bg-danger px-2 rounded">Rejected</span>;
            default: return <span className="badge bg-secondary px-2 rounded">{status}</span>;
        }
    };

    return (
        <>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="display-font fw-bold text-dark mb-1">Manage Reports</h2>
                    <p className="text-muted mb-0">Review, update, and manage all sustainability reports.</p>
                </div>
                <div className="position-relative" style={{ width: '300px' }}>
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input 
                        type="text" 
                        className="form-control form-control-sm ps-5 bg-white border-0 shadow-sm rounded-pill py-2" 
                        placeholder="Search reports..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <div className="card shadow-sm border-0 panel-glass p-1">
                <div className="card-body">
                    {loading ? (
                         <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="text-secondary small fw-bold cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                                            Reported Issue <SortIcon field="title" />
                                        </th>
                                        <th className="text-secondary small fw-bold cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('user_id')}>
                                            Submitted By <SortIcon field="user_id" />
                                        </th>
                                        <th className="text-secondary small fw-bold cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('location')}>
                                            Location <SortIcon field="location" />
                                        </th>
                                        <th className="text-secondary small fw-bold cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                            Status <SortIcon field="status" />
                                        </th>
                                        <th className="text-secondary small fw-bold cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                                            Date <SortIcon field="created_at" />
                                        </th>
                                        <th className="text-secondary small fw-bold text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report, idx) => (
                                        <motion.tr 
                                            key={report._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td>
                                                <div className="fw-bold text-dark">{report.title}</div>
                                                <div className="text-muted small text-uppercase">{report.report_type}</div>
                                            </td>
                                            <td>
                                                <div className="small fw-bold text-dark">{report.user_id?.name || 'Unknown User'}</div>
                                                <div className="text-muted small" style={{fontSize: '0.7rem'}}>{report.user_id?.email}</div>
                                            </td>
                                            <td className="text-muted small">{report.location}</td>
                                            <td>{getStatusBadge(report.status)}</td>
                                            <td className="text-muted small">{new Date(report.created_at).toLocaleDateString()}</td>
                                            <td className="text-end">
                                                <select 
                                                    className="form-select form-select-sm d-inline-block w-auto me-2 border-0 bg-light"
                                                    value={report.status}
                                                    onChange={(e) => updateStatus(report._id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approve</option>
                                                    <option value="resolved">Resolve</option>
                                                    <option value="rejected">Reject</option>
                                                </select>
                                                <button onClick={() => handleDelete(report._id)} className="btn btn-sm btn-outline-danger border-0">
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {reports.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">No reports available.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalCount > 0 && (
                    <div className="card-footer bg-white border-top-0 px-4 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small fw-bold">
                                Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
                            </div>
                            
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-1">
                                    <span className="small text-muted fw-bold text-uppercase">Show</span>
                                    <select 
                                        className="form-select form-select-sm border-0 bg-light rounded-3 fw-bold"
                                        value={limit}
                                        onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                                        style={{ width: '70px' }}
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                    <span className="small text-muted fw-bold text-uppercase">entries</span>
                                </div>

                                <nav aria-label="Page navigation">
                                    <ul className="pagination pagination-sm mb-0 gap-1">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link border-0 bg-light rounded-3 text-dark fw-bold" onClick={() => setPage(page - 1)}>Prev</button>
                                        </li>
                                        
                                        {[...Array(totalPages)].map((_, i) => {
                                            const p = i + 1;
                                            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                                return (
                                                    <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                                        <button 
                                                            className={`page-link border-0 rounded-3 fw-bold ${page === p ? 'btn-eco-primary text-white' : 'bg-light text-dark'}`} 
                                                            onClick={() => setPage(p)}
                                                        >
                                                            {p}
                                                        </button>
                                                    </li>
                                                );
                                            } else if (p === page - 2 || p === page + 2) {
                                                return <li key={p} className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>;
                                            }
                                            return null;
                                        })}

                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link border-0 bg-light rounded-3 text-dark fw-bold" onClick={() => setPage(page + 1)}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ManageReports;

