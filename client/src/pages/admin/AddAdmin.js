import React, { useState } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiUserPlus, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';

const AddAdmin = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            await api.post('/admin/auth/register', 
                { 
                    username: formData.username, 
                    email: formData.email, 
                    password: formData.password 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('New Admin created successfully!');
            setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content-fade">
             <header className="mb-5">
                <h1 className="h3 fw-bold text-dark display-font mb-2">Administrative Scaling</h1>
                <p className="text-muted">Register additional administrative accounts for decentralized system management.</p>
            </header>

            <div className="row justify-content-center">
                <div className="col-md-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-eco p-5 border-0 shadow-sm"
                    >
                        <div className="text-center mb-5">
                            <div className="bg-primary text-white rounded shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <FiUserPlus size={32} />
                            </div>
                            <h3 className="fw-bold mb-1">Scale Admin Authority</h3>
                            <p className="text-muted small">Initialize a new secure administrative credential set</p>
                        </div>

                        {error && <div className="alert alert-danger mb-4 rounded-4 border-0 shadow-sm p-3 small fw-bold text-center">{error}</div>}
                        {success && <div className="alert alert-success mb-4 rounded-4 border-0 shadow-sm p-3 small d-flex align-items-center justify-content-center gap-2 fw-bold">
                            <FiCheckCircle /> {success}
                        </div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted mb-2 ls-1">Username Identity</label>
                                <div className="position-relative">
                                    <FiUserPlus className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                    <input
                                        type="text"
                                        className="form-control-eco ps-5"
                                        placeholder="system_admin_x"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted mb-2 ls-1">Email Communication</label>
                                <div className="position-relative">
                                    <FiMail className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                    <input
                                        type="email"
                                        className="form-control-eco ps-5"
                                        placeholder="admin@econexus.io"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted mb-2 ls-1">Secure Keypoint</label>
                                <div className="position-relative">
                                    <FiLock className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                    <input
                                        type="password"
                                        className="form-control-eco ps-5"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="form-label small fw-bold text-uppercase text-muted mb-2 ls-1">Verification Confirmation</label>
                                <div className="position-relative">
                                    <FiLock className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                    <input
                                        type="password"
                                        className="form-control-eco ps-5"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-eco-primary w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
                                disabled={loading}
                            >
                                <FiCheckCircle /> {loading ? 'Authorizing...' : 'Initialize Admin Credentials'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};


export default AddAdmin;
