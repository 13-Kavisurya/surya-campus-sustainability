import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const UsageLimits = () => {
    const [limits, setLimits] = useState([]);
    const [status, setStatus] = useState(null);
    const [editingLimit, setEditingLimit] = useState(null);
    const [isSendingReport, setIsSendingReport] = useState(false);
    const [formData, setFormData] = useState({
        resourceType: 'Water',
        monthlyLimit: '',
        unit: 'units',
        alertThreshold: 80
    });

    useEffect(() => {
        fetchLimits();
        fetchStatus();
    }, []);

    const fetchLimits = async () => {
        try {
            const { data } = await api.get('/limits');
            setLimits(data);
        } catch (err) {
            console.error('Failed to fetch limits');
        }
    };

    const fetchStatus = async () => {
        try {
            const { data } = await api.get('/limits/status');
            setStatus(data);
        } catch (err) {
            console.error('Failed to fetch status');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.monthlyLimit) {
                alert('Please enter a monthly limit');
                return;
            }
            await api.post('/limits', formData);
            fetchLimits();
            fetchStatus();
            setFormData({ resourceType: 'Water', monthlyLimit: '', unit: 'units', alertThreshold: 80 });
            setEditingLimit(null);
            alert('Limit set successfully');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to set limit');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this limit?')) return;
        try {
            await api.delete(`/limits/${id}`);
            fetchLimits();
            fetchStatus();
            alert('Limit deleted successfully');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete limit');
        }
    };

    const handleEdit = (limit) => {
        setEditingLimit(limit._id);
        setFormData({
            resourceType: limit.resourceType,
            monthlyLimit: limit.monthlyLimit,
            unit: limit.unit,
            alertThreshold: limit.alertThreshold
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingLimit(null);
        setFormData({ resourceType: 'Water', monthlyLimit: '', unit: 'units', alertThreshold: 80 });
    };

    const handleSendMonthlyReport = async () => {
        if (!window.confirm('Send monthly sustainability report to all users? This action cannot be undone.')) return;
        setIsSendingReport(true);
        try {
            const response = await api.post('/admin/send-monthly-report');
            if (response.data.simulated) {
                alert(`⚠️ SIMULATION MODE\n\n${response.data.warning}\n\nTo send real emails, configure:\n- EMAIL_USER (Gmail address)\n- EMAIL_PASS (Gmail app password)\n\nin the server/.env file`);
            } else {
                alert('✅ Monthly reports sent successfully to all users!');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to send reports');
        } finally {
            setIsSendingReport(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Water': return 'bi-droplet-fill text-info';
            case 'Electricity': return 'bi-lightning-fill text-warning';
            case 'Waste': return 'bi-trash-fill text-danger';
            case 'Transport': return 'bi-bus-front-fill text-primary';
            default: return 'bi-graph-up-arrow text-success';
        }
    };

    const getProgressColor = (statusType) => {
        switch (statusType) {
            case 'exceeded': return 'bg-danger';
            case 'warning': return 'bg-warning';
            default: return 'bg-success';
        }
    };

    return (
        <>
            <div className="mb-5">
                <h1 className="display-font fw-bold text-dark">Governance & Controls</h1>
                <p className="text-muted">Establish consumption thresholds and automated alert triggers for campus operations.</p>
            </div>

            <div className="row g-4">
                <div className="col-12 col-xl-8">
                    {/* Live Monitoring Section */}
                    {status && (
                        <div className="card-eco p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 bg-light bg-opacity-50 px-3 py-2 rounded">
                                <h6 className="mb-0 fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.8rem' }}>
                                    Live Monitoring Flow: <span className="text-success fst-italic">{status.month}</span>
                                </h6>
                                <span className="badge bg-white text-secondary border shadow-sm d-flex align-items-center gap-2 px-3 py-2">
                                    <div className="bg-success rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                                    Real-time Sync
                                </span>
                            </div>

                            <div className="row g-4 px-2">
                                {status.resources.map((resource, idx) => (
                                    <div className="col-12 col-md-6" key={resource.resourceType}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`card h-100 border-0 shadow-sm custom-border-left ${
                                                resource.status === 'exceeded' ? 'border-start border-danger border-4' :
                                                resource.status === 'warning' ? 'border-start border-warning border-4' : 
                                                'border-start border-success border-4'
                                            }`}
                                        >
                                            <div className="card-body p-4 d-flex flex-column">
                                                <div className="d-flex align-items-center gap-3 mb-4">
                                                    <div className="bg-light rounded p-3 text-center" style={{ width: '56px', height: '56px' }}>
                                                        <i className={`bi ${getIcon(resource.resourceType)} fs-4`}></i>
                                                    </div>
                                                    <div>
                                                        <h5 className="fw-bold mb-1 text-dark text-uppercase">{resource.resourceType}</h5>
                                                        <small className={`fw-bold text-uppercase d-flex align-items-center gap-1 ${
                                                            resource.status === 'exceeded' ? 'text-danger' : 
                                                            resource.status === 'warning' ? 'text-warning' : 'text-success'
                                                        }`} style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                                            {resource.status === 'exceeded' && <i className="bi bi-exclamation-triangle-fill"></i>}
                                                            {resource.status === 'normal' && <i className="bi bi-check-circle-fill"></i>}
                                                            {resource.percentUsed}% Utilization
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="progress mb-4" style={{ height: '8px' }}>
                                                    <div 
                                                        className={`progress-bar ${getProgressColor(resource.status)}`}
                                                        role="progressbar" 
                                                        style={{ width: `${Math.min(resource.percentUsed, 100)}%` }}
                                                        aria-valuenow={resource.percentUsed} 
                                                        aria-valuemin="0" 
                                                        aria-valuemax="100">
                                                    </div>
                                                </div>

                                                <div className="row g-2 mt-auto text-center">
                                                    <div className="col-4">
                                                        <div className="bg-light rounded py-2 px-1 border h-100">
                                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>Used</small>
                                                            <strong className="text-dark small m-0 lh-1">{resource.used} {resource.unit}</strong>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="bg-light rounded py-2 px-1 border h-100">
                                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>Limit</small>
                                                            <strong className="text-dark small m-0 lh-1">{resource.limit} {resource.unit}</strong>
                                                        </div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className={`rounded py-2 px-1 border h-100 ${
                                                            resource.status === 'exceeded' ? 'bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger' :
                                                            resource.status === 'warning' ? 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning' : 
                                                            'bg-success bg-opacity-10 border-success border-opacity-25 text-success'
                                                        }`}>
                                                            <small className="opacity-75 d-block text-uppercase fw-bold" style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>Delta</small>
                                                            <strong className="small m-0 lh-1">{resource.remaining} {resource.unit}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Active Limits */}
                    {limits.length > 0 && (
                        <div className="card-eco p-4">
                            <h6 className="fw-bold mb-4 text-dark text-uppercase d-flex align-items-center gap-2 border-bottom pb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                                <i className="bi bi-gear-fill text-success"></i> Active Policies
                            </h6>
                            
                            <div className="d-flex flex-column gap-3">
                                {limits.map((limit, idx) => (
                                    <motion.div
                                        key={limit._id}
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white border rounded p-3 d-flex align-items-center justify-content-between shadow-sm hover-lift"
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded p-2 text-center" style={{ width: '40px', height: '40px' }}>
                                                <i className={`bi ${getIcon(limit.resourceType)} fs-5`}></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0 text-uppercase" style={{ fontSize: '0.85rem' }}>{limit.resourceType}</h6>
                                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                                                    {limit.monthlyLimit} {limit.unit} &bull; Alert @ {limit.alertThreshold}%
                                                </small>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-light border text-primary shadow-sm"
                                                onClick={() => handleEdit(limit)}
                                                title="Edit limit"
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger shadow-sm"
                                                onClick={() => handleDelete(limit._id)}
                                                title="Delete limit"
                                            >
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-12 col-xl-4">
                    <div className="position-sticky" style={{ top: '2rem' }}>
                        <div className="card-eco p-4 mb-4">
                            <h6 className="fw-bold mb-4 text-dark text-uppercase d-flex align-items-center gap-2 border-bottom pb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                                <i className="bi bi-sliders text-success"></i> 
                                {editingLimit ? 'Recalibrate Limit' : 'Policy Definition'}
                            </h6>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted fw-bold text-uppercase small" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Resource Context</label>
                                    <select 
                                        className="form-select form-control-eco fw-bold"
                                        value={formData.resourceType}
                                        onChange={(e) => setFormData({...formData, resourceType: e.target.value})}
                                    >
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Waste">Waste</option>
                                        <option value="Transport">Transport</option>
                                    </select>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <label className="form-label text-muted fw-bold text-uppercase small" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Unit Limit</label>
                                        <input 
                                            type="number" 
                                            className="form-control form-control-eco fw-bold"
                                            value={formData.monthlyLimit}
                                            onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})}
                                            required min="0"
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-muted fw-bold text-uppercase small" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Metrics Unit</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-eco fw-bold"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                            placeholder="e.g. kWh"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label m-0 text-muted fw-bold text-uppercase small" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Alert Trigger Point</label>
                                        <span className="badge bg-success">{formData.alertThreshold}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        className="form-range" 
                                        min="0" max="100" 
                                        value={formData.alertThreshold}
                                        onChange={(e) => setFormData({...formData, alertThreshold: parseInt(e.target.value)})}
                                    />
                                    <div className="d-flex justify-content-between text-muted fw-bold text-uppercase pt-1" style={{ fontSize: '0.55rem', letterSpacing: '1px' }}>
                                        <span>Conservative</span>
                                        <span>Critical</span>
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-eco-primary flex-grow-1 text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                                        {editingLimit ? 'Apply Protocol Update' : 'Manifest Policy'}
                                    </button>
                                    {editingLimit && (
                                        <button type="button" onClick={handleCancel} className="btn btn-outline-danger align-items-center d-flex fw-bold px-3">
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="mt-4 bg-light border p-3 rounded text-muted small border-start border-4 border-warning">
                                <h6 className="fw-bold d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.8rem' }}>
                                    <i className="bi bi-info-circle-fill text-warning"></i> System Logic
                                </h6>
                                <span style={{ fontSize: '0.75rem' }}>Defined limits will automatically cascade across all dashboard visualizations. Warning states are triggered at the specified alert threshold.</span>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary w-100 py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 text-uppercase fw-bold border-0"
                            style={{ background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)', letterSpacing: '1px', fontSize: '0.85rem' }}
                            onClick={handleSendMonthlyReport}
                            disabled={isSendingReport}
                        >
                            {isSendingReport ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Sending Reports...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-envelope-paper-fill"></i> Send Monthly Reports
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UsageLimits;

