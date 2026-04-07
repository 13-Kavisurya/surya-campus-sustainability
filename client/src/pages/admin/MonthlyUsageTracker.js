import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiUser, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const MonthlyUsageTracker = () => {
    const [usageLogs, setUsageLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState(-1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsageData();
    }, [page, limit, filter, debouncedSearchTerm, sortBy, sortOrder]);

    const fetchUsageData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/usage', {
                params: {
                    page,
                    limit,
                    resourceType: filter === 'all' ? undefined : filter,
                    search: debouncedSearchTerm,
                    sortBy,
                    sortOrder
                }
            });
            setUsageLogs(res.data.usageData);
            setTotalPages(res.data.totalPages);
            setTotalCount(res.data.totalCount);
        } catch (error) {
            console.error('Failed to fetch usage data', error);
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

    const getResourceBadge = (type) => {
        switch (type) {
            case 'Water': return <span className="badge bg-info-light text-info rounded-pill px-3 py-2">Water</span>;
            case 'Electricity': return <span className="badge bg-warning-light text-warning rounded-pill px-3 py-2">Electricity</span>;
            case 'Waste': return <span className="badge bg-success-light text-success rounded-pill px-3 py-2">Waste</span>;
            case 'Transport': return <span className="badge bg-secondary-light text-secondary rounded-pill px-3 py-2">Transport</span>;
            default: return <span className="badge bg-light text-muted rounded-pill px-3 py-2">{type}</span>;
        }
    };

    const formatMetrics = (metrics, type) => {
        if (!metrics) return 'No data';
        switch (type) {
            case 'Water': return `${metrics.meterReading || 0} Litres`;
            case 'Electricity': return `${metrics.unitsConsumed || 0} kWh`;
            case 'Waste': return `${metrics.volume || 0} kg`;
            case 'Transport': return `${metrics.distanceCovered || 0} km`;
            default: return 'Details available';
        }
    };

    const filteredLogs = usageLogs; // Server-side filtering now

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-grow text-success" role="status"></div>
            <p className="mt-3 text-muted small fw-bold text-uppercase">Aggregating Global Usage Metrics...</p>
        </div>
    );

    return (
        <div className="admin-content-fade">
            <header className="mb-5 d-flex justify-content-between align-items-center">
                <div>
                    <h1 className="h1 fw-bold text-dark display-font mb-2" style={{ fontSize: '2.5rem' }}>Monthly Usage History</h1>
                    <p className="text-muted fs-5">Monitor and export campus resource consumption logs.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="position-relative" style={{ width: '300px' }}>
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input 
                            type="text" 
                            className="form-control ps-5 bg-white border shadow-sm rounded-pill py-2" 
                            placeholder="Search logs..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="btn btn-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-plus-lg"></i> New Log
                    </button>
                    <button className="btn btn-outline-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-download"></i> Export
                    </button>
                </div>
            </header>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div className="btn-group shadow-sm rounded-4 overflow-hidden">
                    {['all', 'Water', 'Electricity', 'Waste', 'Transport'].map((s) => (
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
                    Total Records: <span className="text-dark">{totalCount}</span>
                </div>
            </div>

            <div className="card-eco p-0 border-0 overflow-hidden shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('resourceType')}>
                                    Resource <SortIcon field="resourceType" />
                                </th>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                                    Date <SortIcon field="date" />
                                </th>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('location')}>
                                    Location <SortIcon field="location" />
                                </th>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0">Metrics</th>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('usageReduced')}>
                                    Usage Reduced <SortIcon field="usageReduced" />
                                </th>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('totalCost')}>
                                    Cost <SortIcon field="totalCost" />
                                </th>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('updatedAt')}>
                                    Updated At <SortIcon field="updatedAt" />
                                </th>
                                <th className="px-4 py-3 text-dark small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('loggedBy')}>
                                    Logged By <SortIcon field="loggedBy" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredLogs.map((log, index) => (
                                    <motion.tr 
                                        key={log._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <td className="px-4 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px', backgroundColor: 'transparent', borderColor: '#eef2f7' }}>
                                                    {log.resourceType === 'Water' && <i className="bi bi-droplet text-info fs-5"></i>}
                                                    {log.resourceType === 'Electricity' && <i className="bi bi-lightning-charge text-warning fs-5"></i>}
                                                    {log.resourceType === 'Waste' && <i className="bi bi-trash text-danger fs-5"></i>}
                                                    {log.resourceType === 'Transport' && <i className="bi bi-arrow-repeat text-success fs-5"></i>}
                                                </div>
                                                <span className="fw-bold text-dark fs-5">{log.resourceType}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="fw-bold text-dark">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-muted">{log.location}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="d-flex flex-wrap gap-2">
                                                {Object.entries(log.metrics || {}).map(([key, val]) => (
                                                    <span key={key} className="badge bg-light text-muted border-0 py-2 px-3 fw-medium" style={{ fontSize: '0.8rem', borderRadius: '4px' }}>
                                                        {key}: <span className="fw-bold text-dark">{val}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="fw-bold text-dark fs-5">{log.usageReduced} Units</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="fw-bold text-dark fs-5">${log.totalCost?.toFixed(2) || '0.00'}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-muted small">
                                                {log.updatedAt ? new Date(log.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="d-flex flex-column">
                                                <div className="small fw-semibold text-dark">{log.loggedBy?.name || 'Unknown Staff'}</div>
                                                <div className="text-muted" style={{fontSize: '0.7rem'}}>Staff Member</div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan="5" className="px-4 py-5 text-center text-muted small fw-bold text-uppercase">No usage logs match this filter.</td></tr>
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

export default MonthlyUsageTracker;
