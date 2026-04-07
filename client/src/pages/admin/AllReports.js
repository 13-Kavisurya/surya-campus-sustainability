import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiFileText, FiMapPin } from 'react-icons/fi';

const AllReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
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
    }, [page, limit, filter, debouncedSearchTerm, sortBy, sortOrder]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/reports', {
                params: {
                    page,
                    limit,
                    status: filter === 'all' ? undefined : filter,
                    search: debouncedSearchTerm,
                    sortBy,
                    sortOrder
                }
            });
            setReports(res.data.reports);
            setTotalPages(res.data.totalPages);
            setTotalCount(res.data.totalCount);
        } catch (error) {
            console.error('Failed to fetch reports', error);
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this report data from the system?')) {
            try {
                await api.delete(`/admin/reports/${id}`);
                setReports(reports.filter(r => r._id !== id));
            } catch (error) {
                console.error('Failed to delete report', error);
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="badge bg-warning-light text-warning rounded-pill px-3 py-2">Pending Review</span>;
            case 'approved': return <span className="badge bg-primary-light text-primary rounded-pill px-3 py-2">Active Task</span>;
            case 'resolved': return <span className="badge bg-success-light text-success rounded-pill px-3 py-2">Resolved</span>;
            case 'rejected': return <span className="badge bg-danger-light text-danger rounded-pill px-3 py-2">Closed/Rejected</span>;
            default: return <span className="badge bg-light text-muted rounded-pill px-3 py-2">{status}</span>;
        }
    };

    const filteredReports = reports; // Server-side filtering now

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-grow text-success" role="status"></div>
            <p className="mt-3 text-muted small fw-bold text-uppercase">Fetching historical records...</p>
        </div>
    );

    return (
        <div className="admin-content-fade">
            <header className="mb-5 d-flex justify-content-between align-items-start">
                <div>
                    <h1 className="h3 fw-bold text-dark display-font mb-2">Global Sustainability Audit</h1>
                    <p className="text-muted">Universal oversight across all reporting streams and incident categories.</p>
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
            </header>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div className="btn-group shadow-sm rounded-4 overflow-hidden">
                    {['all', 'pending', 'approved', 'resolved', 'rejected'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`btn btn-sm px-4 py-2 text-capitalize fw-bold ${filter === s ? 'btn-success' : 'btn-light'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="text-muted small fw-bold text-uppercase">
                    Total Volume: <span className="text-dark">{totalCount}</span> entries
                </div>
            </div>

            <div className="card-eco p-0 border-0 overflow-hidden shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                                    Report Artifact <SortIcon field="title" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('user_id')}>
                                    Originator (Initiated By) <SortIcon field="user_id" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('resolvedBy')}>
                                    Resolver (Handled By) <SortIcon field="resolvedBy" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                    Current State <SortIcon field="status" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 text-end">Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredReports.map((report, index) => (
                                    <motion.tr 
                                        key={report._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <td className="px-4 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light p-2 rounded-3 text-success border">
                                                    <FiFileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark mb-1">{report.title}</div>
                                                    <div className="d-flex align-items-center gap-2 text-muted" style={{fontSize: '0.75rem'}}>
                                                        <FiMapPin size={12} /> {report.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="small fw-semibold text-dark">{report.user_id?.name || 'Deactivated Account'}</div>
                                            <div className="text-muted d-flex align-items-center gap-1" style={{fontSize: '0.7rem'}}>
                                                <span className="badge bg-light text-dark border text-uppercase" style={{fontSize: '0.55rem'}}>{report.user_id?.user_type || 'user'}</span>
                                                {report.user_id?.email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {report.resolvedBy ? (
                                                <>
                                                    <div className="small fw-semibold text-dark">{report.resolvedBy.name}</div>
                                                    <div className="text-muted d-flex align-items-center gap-1" style={{fontSize: '0.7rem'}}>
                                                        <span className="badge bg-success-light text-success border text-uppercase" style={{fontSize: '0.55rem'}}>Staff</span>
                                                        {report.resolvedBy.email}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-muted small fst-italic">Not resolved yet</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-4 py-4 text-end">
                                            <button 
                                                onClick={() => handleDelete(report._id)} 
                                                className="btn btn-light btn-sm text-danger border shadow-sm p-2"
                                                title="Hard Delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredReports.length === 0 && (
                                <tr><td colSpan="5" className="px-4 py-5 text-center text-muted small fw-bold text-uppercase">No reports matching the current filter found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-4 px-4 pb-4">
                    <div className="text-muted small fw-bold text-uppercase">
                        Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-bold text-uppercase">Show</span>
                            <select 
                                className="form-select form-select-sm border-0 bg-light rounded-pill px-3 fw-bold"
                                value={limit}
                                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                                style={{ width: '80px' }}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            <span className="small text-muted fw-bold text-uppercase">entries</span>
                        </div>

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
            </div>
        </div>
    );
};


export default AllReports;
