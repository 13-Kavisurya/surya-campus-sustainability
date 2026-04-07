import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ReportIssue = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        report_type: 'waste',
        title: '',
        location: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/reports', formData);
            toast.success('Sustainability report dispatched successfully!');
            setSuccess(true);
            setTimeout(() => {
                navigate('/student/my-reports');
            }, 2000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error submitting report';
            toast.error(msg);
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-3xl mx-auto">
                <div className="mb-4">
                    <h2 className="display-font fw-bold text-dark mb-1">Report Sustainability Issue</h2>
                    <p className="text-muted">Help us keep the campus green by reporting issues promptly.</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card border-0"
                >
                    <div className="card-body p-4 p-md-5">
                        {success ? (
                            <div className="text-center py-5">
                                <div className="bg-success text-white rounded-circle d-inline-flex mb-3 align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-check-lg fs-1"></i>
                                </div>
                                <h4>Report Submitted Successfully!</h4>
                                <p className="text-muted">Redirecting you to your reports...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger mb-4">{error}</div>}
                                
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Report Type</label>
                                        <select 
                                            className="form-select form-select-lg border-0 bg-light"
                                            value={formData.report_type}
                                            onChange={(e) => setFormData({...formData, report_type: e.target.value})}
                                        >
                                            <option value="waste">Waste Management</option>
                                            <option value="water">Water Leak / Usage</option>
                                            <option value="energy">Energy / Electricity</option>
                                            <option value="suggestion">Green Suggestion</option>
                                        </select>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Location</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="form-control form-control-lg border-0 bg-light"
                                            placeholder="e.g. Building A, Room 101"
                                            value={formData.location}
                                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Issue Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="form-control form-control-lg border-0 bg-light"
                                            placeholder="Brief description of the issue"
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Detailed Description</label>
                                        <textarea 
                                            required
                                            className="form-control border-0 bg-light"
                                            rows="4"
                                            placeholder="Provide more context..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="mt-5 d-flex justify-content-end">
                                    <button 
                                        type="button" 
                                        className="btn btn-light me-3 px-4 fw-bold"
                                        onClick={() => navigate('/student/dashboard')}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-eco-primary px-5 fw-bold"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Syncing...
                                            </>
                                        ) : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default ReportIssue;

