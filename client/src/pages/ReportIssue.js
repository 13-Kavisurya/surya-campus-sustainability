import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
    const [formData, setFormData] = useState({
        resourceType: 'Water',
        location: '',
        issueType: '',
        description: '',
        imageUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/issues', formData);
            setSuccess(true);
            const dashboardPath = user?.role === 'manager' ? '/manager' : '/student';
            setTimeout(() => navigate(dashboardPath), 2000);
        } catch (err) {
            console.error('Failed to submit issue');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resources = [
        { name: 'Water', icon: 'bi-droplet-fill', color: 'text-info', bg: 'bg-info' },
        { name: 'Electricity', icon: 'bi-lightning-fill', color: 'text-warning', bg: 'bg-warning' },
        { name: 'Waste', icon: 'bi-trash-fill', color: 'text-danger', bg: 'bg-danger' },
        { name: 'Transport', icon: 'bi-bus-front-fill', color: 'text-primary', bg: 'bg-primary' },
    ];

    if (success) {
        return (
            <>
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card-eco p-5 p-md-5 text-center d-flex flex-column align-items-center gap-3 border shadow-sm"
                        style={{ maxWidth: '500px' }}
                    >
                        <div className="bg-success bg-opacity-10 rounded-circle text-success d-flex align-items-center justify-content-center mb-2 shadow-sm" style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-check-lg" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h2 className="fw-bolder text-dark mb-1">Report Submitted!</h2>
                        <p className="text-muted fw-bold text-uppercase small" style={{ letterSpacing: '2px' }}>Redirecting to your dashboard...</p>
                        
                        <div className="progress w-100 mt-4" style={{ height: '4px' }}>
                            <motion.div 
                                className="progress-bar bg-success"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                            />
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => navigate(-1)}
                className="btn btn-link text-muted fw-bold text-uppercase text-decoration-none d-flex align-items-center gap-2 p-0 mb-4 hover-lift d-inline-flex"
                style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>

            <div className="mb-5">
                <h1 className="display-font fw-bold text-dark mb-2">Report an Issue</h1>
                <p className="text-muted">Help us save campus resources by reporting problems.</p>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto mx-xl-0" style={{ maxWidth: '800px' }}>
                <div className="card-eco p-4 p-md-5 d-flex flex-column gap-5">
                    
                    {/* Resource Selection */}
                    <div>
                        <label className="form-label text-muted fw-bold text-uppercase small mb-3 border-bottom pb-2 w-100 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                            <i className="bi bi-diagram-3-fill text-success"></i> Select Resource
                        </label>
                        <div className="row g-3">
                            {resources.map((res) => (
                                <div className="col-6 col-md-3" key={res.name}>
                                    <div
                                        onClick={() => setFormData({ ...formData, resourceType: res.name })}
                                        className={`p-4 rounded text-center cursor-pointer transition-all border shadow-sm d-flex flex-column align-items-center gap-3 h-100 ${
                                            formData.resourceType === res.name
                                                ? `${res.bg} bg-opacity-10 border-${res.bg.split('-')[1]} shadow`
                                                : 'bg-white hover:bg-light'
                                        }`}
                                    >
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center bg-white border shadow-sm ${res.color}`} style={{ width: '48px', height: '48px' }}>
                                            <i className={`bi ${res.icon} fs-4`}></i>
                                        </div>
                                        <span className={`fw-bold small ${formData.resourceType === res.name ? 'text-dark' : 'text-muted'}`}>{res.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details section */}
                    <div className="row g-4">
                        <div className="col-12 col-md-6">
                            <label className="form-label text-muted fw-bold text-uppercase small mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                <i className="bi bi-geo-alt-fill text-success"></i> Location
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-eco fw-bold bg-light py-3"
                                placeholder="e.g., Block A, 2nd Floor"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label text-muted fw-bold text-uppercase small mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                <i className="bi bi-exclamation-circle-fill text-warning"></i> Issue Type
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-eco fw-bold bg-light py-3"
                                placeholder="e.g., Water Leak, Power Cut"
                                value={formData.issueType}
                                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label text-muted fw-bold text-uppercase small mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                            <i className="bi bi-file-text-fill text-primary"></i> Description
                        </label>
                        <textarea
                            className="form-control form-control-eco fw-bold bg-light py-3"
                            placeholder="Describe the issue in detail..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows="4"
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-eco-primary py-3 rounded text-uppercase fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '0.9rem', letterSpacing: '1px' }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Submitting...
                            </>
                        ) : (
                            <>Submit Report <i className="bi bi-send-fill ms-1"></i></>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
};

export default ReportIssue;

