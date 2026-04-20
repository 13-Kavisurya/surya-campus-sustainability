import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminRegister = () => {
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AdminAuthContext);
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // 1. Call backend registration
            const res = await api.post('/admin/auth/register', { name, email, password });
            
            // 2. Set token and context (mirroring AdminAuthContext login logic)
            localStorage.setItem('adminToken', res.data.token);
            // We use the login function from context if possible, but here we just registered
            // For simplicity, we manually set the admin and redirect
            toast.success('Admin account created successfully!');
            navigate('/admin/dashboard');
            window.location.reload(); // Refresh to ensure context updates
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create admin account.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center position-relative px-3"
            style={{ backgroundColor: 'var(--eco-bg, #0f172a)' }}
        >
            {/* Background decorative blobs */}
            <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div className="position-absolute rounded-circle" style={{
                    width: '600px', height: '600px', top: '-15%', right: '-10%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />
                <div className="position-absolute rounded-circle" style={{
                    width: '500px', height: '500px', bottom: '-15%', left: '-10%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="glass-card p-4 p-md-5 position-relative z-1 border-0 shadow-2xl"
                style={{ width: '100%', maxWidth: '440px' }}
            >
                {/* Header */}
                <div className="text-center mb-4">
                    <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
                        style={{
                            width: '60px', height: '60px',
                            background: 'linear-gradient(135deg, #10b981, #3b82f6)'
                        }}
                    >
                        <i className="bi bi-person-plus-fill fs-3 text-white"></i>
                    </div>
                    <h2 className="fw-bold display-font text-dark mb-1">Create Admin</h2>
                    <p className="text-muted small">System Registration</p>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                >
                    {/* Name */}
                    <div className="mb-3 position-relative">
                        <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-control-eco w-100 ps-5"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-3 position-relative">
                        <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control-eco w-100 ps-5"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4 position-relative">
                        <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control-eco w-100 ps-5 pe-5"
                            required
                            minLength="6"
                        />
                        <button
                            type="button"
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted p-0 border-0"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-eco-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderColor: 'transparent' }}
                    >
                        {isSubmitting ? (
                            <div className="spinner-border spinner-border-sm text-light" role="status">
                                <span className="visually-hidden">Creating...</span>
                            </div>
                        ) : (
                            <>
                                <i className="bi bi-shield-check"></i> Register Administrator
                            </>
                        )}
                    </button>
                </motion.form>

                {/* Footer links */}
                <div className="text-center mt-4 border-top pt-3">
                    <p className="small text-muted mb-2">Already have an admin account?</p>
                    <Link
                        to="/admin/login"
                        className="text-primary text-decoration-none fw-bold"
                    >
                        Sign In Here
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminRegister;
