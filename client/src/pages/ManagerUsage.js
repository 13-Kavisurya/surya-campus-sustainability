import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const ManagerUsage = () => {
    const [usageLogs, setUsageLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingLog, setEditingLog] = useState(null);
    const [usageData, setUsageData] = useState({
        resourceType: 'Water',
        metrics: { units: 0 },
        totalCost: 0,
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchUsageLogs();
    }, []);

    const fetchUsageLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/usage');
            setUsageLogs(data);
        } catch (err) {
            console.error('Failed to fetch usage logs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLog) {
                await api.put(`/usage/${editingLog._id}`, usageData);
                alert('Usage log updated successfully');
                setEditingLog(null);
            } else {
                await api.post('/usage', usageData);
                alert('Usage logged successfully');
            }

            setUsageData({
                resourceType: 'Water',
                metrics: { units: 0 },
                totalCost: 0,
                date: new Date().toISOString().split('T')[0]
            });
            fetchUsageLogs();
        } catch (err) {
            alert(`Failed to ${editingLog ? 'update' : 'log'} usage`);
        }
    };

    const handleEdit = (log) => {
        setEditingLog(log);
        setUsageData({
            resourceType: log.resourceType,
            metrics: log.metrics,
            totalCost: log.totalCost,
            date: new Date(log.date).toISOString().split('T')[0]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this usage log?')) return;

        try {
            await api.delete(`/usage/${id}`);
            alert('Usage log deleted successfully');
            fetchUsageLogs();
        } catch (err) {
            alert('Failed to delete usage log');
        }
    };

    const handleCancelEdit = () => {
        setEditingLog(null);
        setUsageData({
            resourceType: 'Water',
            metrics: { units: 0 },
            totalCost: 0,
            date: new Date().toISOString().split('T')[0]
        });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Water': return 'bi-droplet-fill text-info';
            case 'Electricity': return 'bi-lightning-fill text-warning';
            case 'Waste': return 'bi-trash-fill text-danger';
            case 'Transport': return 'bi-bus-front-fill text-primary';
            default: return 'bi-file-earmark-text-fill text-success';
        }
    };

    return (
        <>
            <div className="mb-5">
                <h1 className="display-font fw-bold text-dark mb-1">Resource Management</h1>
                <p className="text-muted mb-0">Add, update, and audit campus resource consumption metrics.</p>
            </div>

            <div className="row g-4">
                {/* Logging Form */}
                <div className="col-12 col-xl-4">
                    <div className="position-sticky" style={{ top: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-eco p-4 border-top border-4 border-success"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                <h6 className="fw-bold mb-0 text-dark text-uppercase d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                                    {editingLog ? <><i className="bi bi-pencil-fill text-primary"></i> Modify Entry</> : <><i className="bi bi-plus-lg text-success"></i> New Log Entry</>}
                                </h6>
                                {editingLog && (
                                    <button onClick={handleCancelEdit} className="btn btn-sm btn-outline-danger border-0">
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label text-muted fw-bold text-uppercase small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Resource Type</label>
                                    <select
                                        className="form-select form-control-eco fw-bold bg-light"
                                        value={usageData.resourceType}
                                        onChange={(e) => setUsageData({ ...usageData, resourceType: e.target.value })}
                                    >
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Waste">Waste</option>
                                        <option value="Transport">Transport</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label text-muted fw-bold text-uppercase small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Units Consumed</label>
                                    <input
                                        type="number"
                                        className="form-control form-control-eco fw-bold bg-light"
                                        value={usageData.metrics.units}
                                        onChange={(e) => setUsageData({
                                            ...usageData,
                                            metrics: { units: parseFloat(e.target.value) || 0 }
                                        })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="form-label text-muted fw-bold text-uppercase small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Total Cost ($)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border opacity-75 fw-bold">$</span>
                                        <input
                                            type="number"
                                            className="form-control form-control-eco fw-bold bg-light px-3 py-2"
                                            value={usageData.totalCost}
                                            onChange={(e) => setUsageData({ ...usageData, totalCost: parseFloat(e.target.value) || 0 })}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label text-muted fw-bold text-uppercase small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Transaction Date</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-eco fw-bold bg-light"
                                        value={usageData.date}
                                        onChange={(e) => setUsageData({ ...usageData, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-eco-primary py-3 fw-bold text-uppercase mt-3 shadow-sm d-flex align-items-center justify-content-center gap-2" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>
                                    <i className="bi bi-save"></i> {editingLog ? 'Update Audit' : 'Confirm Logging'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>

                {/* Usage History */}
                <div className="col-12 col-xl-8">
                    <div className="d-flex align-items-center justify-content-between mb-4 bg-light bg-opacity-50 p-3 rounded border">
                        <h6 className="fw-bold text-dark text-uppercase mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
                            <i className="bi bi-clock-history text-success"></i> Transaction History
                        </h6>
                        <span className="badge bg-success bg-opacity-10 border border-success border-opacity-25 text-success px-3 py-2 rounded-pill fw-bold text-uppercase">
                            {usageLogs.length} Entries
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-5 text-center">
                            <div className="spinner-border text-success mb-3" role="status"></div>
                            <p className="text-muted fw-bold text-uppercase small animate-pulse" style={{ letterSpacing: '2px' }}>Loading audit logs...</p>
                        </div>
                    ) : usageLogs.length === 0 ? (
                        <div className="card-eco p-5 text-center d-flex flex-column align-items-center justify-content-center border border-dashed text-muted">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3 text-secondary opacity-50" style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-file-earmark-text fs-1"></i>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">Ledger Empty</h5>
                            <p className="mb-0">No usage metrics recorded yet. Input data to commence tracking.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {usageLogs.map((log, idx) => (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="card-eco bg-white p-3 p-md-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 border-start border-4 border-success hover-lift"
                                >
                                    <div className="d-flex align-items-center gap-4 border-end-md pe-md-4">
                                        <div className="bg-light rounded-circle border shadow-sm d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                            <i className={`bi ${getIcon(log.resourceType)} fs-3`}></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold text-dark mb-1">{log.resourceType}</h5>
                                            <p className="text-muted mb-0 fw-bold text-uppercase small d-flex align-items-center gap-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                                <i className="bi bi-calendar3"></i>
                                                {new Date(log.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-wrap flex-md-nowrap align-items-center gap-3 flex-grow-1">
                                        <div className="bg-light border rounded px-3 py-2 flex-grow-1">
                                            <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Consumption</small>
                                            <span className="fw-bolder text-dark m-0 fs-5">{log.metrics?.units || 0}</span> <small className="text-muted fw-bold">Units</small>
                                        </div>
                                        <div className="bg-light border rounded px-3 py-2 flex-grow-1">
                                            <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Expenditure</small>
                                            <span className="fw-bolder text-success m-0 fs-5">${log.totalCost}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 justify-content-end mt-3 mt-md-0">
                                        <button
                                            onClick={() => handleEdit(log)}
                                            className="btn btn-sm btn-light border shadow-sm text-primary py-2 px-3"
                                            title="Edit Audit"
                                        >
                                            <i className="bi bi-pencil-fill"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(log._id)}
                                            className="btn btn-sm btn-outline-danger shadow-sm py-2 px-3"
                                            title="Purge Entry"
                                        >
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManagerUsage;

