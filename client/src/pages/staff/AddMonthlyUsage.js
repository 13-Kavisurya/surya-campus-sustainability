import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiZap, FiDroplet, FiTrash2, FiRepeat, FiCheck, FiArrowLeft, FiUploadCloud } from 'react-icons/fi';

const AddMonthlyUsage = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        resourceType: 'Electricity',
        date: new Date().toISOString().split('T')[0],
        location: '',
        usageReduced: '',
        metrics: {}
    });
    const [importSuccess, setImportSuccess] = useState('');
    const [importError, setImportError] = useState('');

    const resourceTypes = [
        { name: 'Electricity', icon: FiZap, color: '#facc15', fields: [
            { key: 'unitsConsumed', label: 'Units Consumed (kWh)', placeholder: 'e.g. 1500' },
            { key: 'tariff', label: 'Tariff Rate ($/kWh)', placeholder: 'e.g. 0.12' }
        ]},
        { name: 'Water', icon: FiDroplet, color: '#38bdf8', fields: [
            { key: 'meterReading', label: 'Meter Reading (litres)', placeholder: 'e.g. 5000' },
            { key: 'costPerUnit', label: 'Cost Per Litre', placeholder: 'e.g. 0.05' }
        ]},
        { name: 'Waste', icon: FiTrash2, color: '#f87171', fields: [
            { key: 'volume', label: 'Volume (kg)', placeholder: 'e.g. 200' },
            { key: 'segregationPercentage', label: 'Segregation %', placeholder: 'e.g. 85' }
        ]},
        { name: 'Transport', icon: FiRepeat, color: '#4ade80', fields: [
            { key: 'fuelUsed', label: 'Fuel Used (litres)', placeholder: 'e.g. 100' },
            { key: 'distanceCovered', label: 'Distance Covered (km)', placeholder: 'e.g. 1200' }
        ]}
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('metric_')) {
            const key = name.split('_')[1];
            setFormData(prev => ({
                ...prev,
                metrics: { ...prev.metrics, [key]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/usage', formData);
            setSuccess(true);
            setTimeout(() => navigate('/staff/monthly-usage'), 2000);
        } catch (err) {
            alert('Failed to log usage data. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const parseCSV = (text) => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(cell => cell.trim());
            if (row.length === headers.length) {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                data.push(obj);
            }
        }
        return data;
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSubmitting(true);
        setImportError('');
        setImportSuccess('');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csvData = parseCSV(event.target.result);
                // Map CSV data to expected API schema
                // Expected CSV Headers: resourceType, metrics_..., usageReduced, date
                const transformedData = csvData.map(row => {
                    const metrics = {};
                    Object.keys(row).forEach(key => {
                        if (key.startsWith('metrics_')) {
                            const metricKey = key.replace('metrics_', '');
                            metrics[metricKey] = Number(row[key]);
                        }
                    });

                    return {
                        resourceType: row.resourceType,
                        location: row.location || '',
                        usageReduced: Number(row.usageReduced),
                        date: row.date ? new Date(row.date) : new Date(),
                        metrics
                    };
                });

                const res = await api.post('/usage/import', { data: transformedData });
                setImportSuccess(res.data.message || 'Import successful!');
                setTimeout(() => navigate('/staff/monthly-usage'), 2000);
            } catch (err) {
                setImportError('Failed to parse or import CSV. Ensure format is correct.');
            } finally {
                setSubmitting(false);
            }
        };
        reader.readAsText(file);
    };

    const activeType = resourceTypes.find(t => t.name === formData.resourceType);

    return (
        <>
            <div className="mb-4 d-flex align-items-center gap-3">
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                >
                    <FiArrowLeft />
                </button>
                <div>
                    <h2 className="display-font fw-bold text-dark mb-1">Add Resource Usage</h2>
                    <p className="text-muted mb-0">Record monthly sustainability data for the campus.</p>
                </div>
                <div className="ms-auto">
                    <label className="btn btn-outline-success d-flex align-items-center gap-2 m-0 border shadow-sm">
                        <FiUploadCloud size={18} /> Import CSV
                        <input type="file" accept=".csv" className="d-none" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-sm panel-glass p-4 p-md-5"
                    >
                        {success ? (
                            <div className="text-center py-5">
                                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                                    <FiCheck size={40} />
                                </div>
                                <h3 className="fw-bold text-dark mb-2">Usage Recorded Successfully</h3>
                                <p className="text-muted">Redirecting you to the history table...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="row g-4">
                                {importSuccess && <div className="col-12"><div className="alert alert-success py-2">{importSuccess}</div></div>}
                                {importError && <div className="col-12"><div className="alert alert-danger py-2">{importError}</div></div>}
                                
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Resource Category</label>
                                    <div className="d-flex flex-wrap gap-3">
                                        {resourceTypes.map(t => (
                                            <button
                                                key={t.name}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, resourceType: t.name, metrics: {} }))}
                                                className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 border transition-all ${formData.resourceType === t.name ? 'border-success bg-success bg-opacity-10 text-success fw-bold shadow-sm' : 'bg-light text-muted'}`}
                                            >
                                                <t.icon /> {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Logging Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        className="form-control-eco"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Location</label>
                                    <input 
                                        type="text"
                                        name="location"
                                        className="form-control-eco"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Block A, Lab 2"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Usage Reduced</label>
                                    <div className="input-group">
                                        <input 
                                            type="number" 
                                            name="usageReduced" 
                                            className="form-control-eco"
                                            value={formData.usageReduced}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 150"
                                            step="0.01"
                                            required
                                        />
                                        <span className="input-group-text bg-light text-muted">Units</span>
                                    </div>
                                </div>

                                <div className="col-12 mt-4">
                                    <h6 className="fw-bold text-dark mb-3">Resource Specific Metrics ({activeType.name})</h6>
                                    <div className="row g-3">
                                        {activeType.fields.map(field => (
                                            <div className="col-md-6" key={field.key}>
                                                <label className="form-label small fw-bold text-muted">{field.label}</label>
                                                <input 
                                                    type="number" 
                                                    name={`metric_${field.key}`} 
                                                    className="form-control-eco"
                                                    value={formData.metrics[field.key] || ''}
                                                    onChange={handleInputChange}
                                                    placeholder={field.placeholder}
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-12 mt-5">
                                    <button 
                                        type="submit" 
                                        className="btn-eco-primary w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <div className="spinner-border spinner-border-sm text-light"></div>
                                        ) : (
                                            <>Save Report & Publish Analytics <FiCheck /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default AddMonthlyUsage;

