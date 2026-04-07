import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiPlus, FiDownload, FiActivity, FiDroplet, FiZap, FiTrash2, FiRepeat } from 'react-icons/fi';

const MonthlyUsage = () => {
    const navigate = useNavigate();
    const [usageData, setUsageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState(-1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const resourceTypes = [
        { name: 'Electricity', icon: FiZap, color: 'warning', metric: 'unitsConsumed' },
        { name: 'Water', icon: FiDroplet, color: 'info', metric: 'meterReading' },
        { name: 'Waste', icon: FiTrash2, color: 'danger', metric: 'volume' },
        { name: 'Transport', icon: FiRepeat, color: 'success', metric: 'distanceCovered' }
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsage();
    }, [page, limit, debouncedSearchTerm, sortBy, sortOrder]);

    const fetchUsage = async () => {
        try {
            setLoading(true);
            const res = await api.get('/usage', {
                params: { 
                    page, 
                    limit,
                    search: debouncedSearchTerm,
                    sortBy,
                    sortOrder
                }
            });
            setUsageData(res.data.usageData);
            setTotalPages(res.data.totalPages);
            setTotalCount(res.data.totalCount);
        } catch (err) {
            console.error('Failed to fetch usage data', err);
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

    const exportToCSV = () => {
        if (usageData.length === 0) return;
        
        const headers = ['Date', 'Type', 'Location', 'Usage Reduced', 'Logged By', 'Updated At', 'Metrics'];
        const rows = usageData.map(u => [
            new Date(u.date).toLocaleDateString(),
            u.resourceType,
            u.location || '-',
            u.usageReduced,
            u.loggedBy?.name || 'Unknown',
            u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : '-',
            JSON.stringify(u.metrics).replace(/,/g, ';')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `resource_usage_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="display-font fw-bold text-dark mb-1">Monthly Usage History</h2>
                    <p className="text-muted mb-0">Monitor and export campus resource consumption logs.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="position-relative" style={{ width: '250px' }}>
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input 
                            type="text" 
                            className="form-control form-control-sm ps-5 bg-white border shadow-sm rounded-pill py-2" 
                            placeholder="Search logs..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="d-flex gap-2">
                        <button 
                            onClick={() => navigate('/staff/add-usage')} 
                            className="btn btn-eco-primary btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
                        >
                            <FiPlus /> New Log
                        </button>
                        <button onClick={exportToCSV} className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 rounded-pill px-3">
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : (
                <>
                    <div className="card border-0 shadow-sm panel-glass p-0 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('resourceType')}>
                                            Resource <SortIcon field="resourceType" />
                                        </th>
                                        <th className="py-3 border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                                            Date <SortIcon field="date" />
                                        </th>
                                        <th className="py-3 border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('location')}>
                                            Location <SortIcon field="location" />
                                        </th>
                                        <th className="py-3 border-0">Metrics</th>
                                        <th className="py-3 border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('usageReduced')}>
                                            Usage Reduced <SortIcon field="usageReduced" />
                                        </th>
                                        <th className="py-3 border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('totalCost')}>
                                            Cost <SortIcon field="totalCost" />
                                        </th>
                                        <th className="py-3 border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('updatedAt')}>
                                            Updated At <SortIcon field="updatedAt" />
                                        </th>
                                        <th className="py-3 border-0 text-end pe-4 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('loggedBy')}>
                                            Logged By <SortIcon field="loggedBy" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usageData.map((usage) => {
                                        const typeInfo = resourceTypes.find(t => t.name === usage.resourceType);
                                        const Icon = typeInfo?.icon || FiActivity;
                                        return (
                                            <tr key={usage._id}>
                                                <td className="px-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className={`bg-${typeInfo?.color || 'secondary'} bg-opacity-10 p-2 rounded text-${typeInfo?.color || 'secondary'}`}>
                                                            <Icon size={18} />
                                                        </div>
                                                        <span className="fw-bold text-dark">{usage.resourceType}</span>
                                                    </div>
                                                </td>
                                                <td>{new Date(usage.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="text-muted small">{usage.location || <span className="text-muted fst-italic">—</span>}</td>
                                                <td>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        {Object.entries(usage.metrics).map(([key, val]) => (
                                                            <span key={key} className="badge bg-light text-dark border fw-normal">
                                                                {key}: <span className="fw-bold">{val}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-dark">{usage.usageReduced} Units</span>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-dark">${usage.totalCost?.toFixed(2) || '0.00'}</span>
                                                </td>
                                                <td className="text-muted small">{usage.updatedAt ? new Date(usage.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                                <td className="text-end pe-4">
                                                    <div className="d-flex flex-column align-items-end">
                                                        <span className="fw-medium text-dark">{usage.loggedBy?.name || 'Auto Logged'}</span>
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Staff Member</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {usageData.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">No usage data found. Start logging to see trends.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && totalCount > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4 px-2">
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
                    )}
                </>
            )}
        </>
    );
};

export default MonthlyUsage;

