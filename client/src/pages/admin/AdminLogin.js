import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminLogin = () => {
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
            await login(email, password);
            toast.success('Welcome back, Admin!');
            navigate('/admin/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid admin credentials.';
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
                style={{ width: '100%', maxWidth: '420px' }}
            >
                {/* Header */}
                <div className="text-center mb-4">
                    <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
                        style={{
                            width: '60px', height: '60px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        }}
                    >
                        <i className="bi bi-shield-lock-fill fs-3 text-white"></i>
                    </div>
                    <h2 className="fw-bold display-font text-dark mb-1">Admin Portal</h2>
                    <p className="text-muted small">Campus Sustainability Platform</p>
                </div>

                {/* Badge */}
                <div className="d-flex justify-content-center mb-4">
                    <span
                        className="badge rounded-pill px-3 py-2 small fw-semibold"
                        style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}
                    >
                        <i className="bi bi-cpu me-1"></i>System Administrator Access
                    </span>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                >
                    {/* Email */}
                    <div className="mb-3 position-relative">
                        <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            id="admin-email"
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control-eco w-100 ps-5"
                            required
                            autoComplete="username"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4 position-relative">
                        <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            id="admin-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control-eco w-100 ps-5 pe-5"
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted p-0 border-0"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        id="admin-login-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-eco-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderColor: 'transparent' }}
                    >
                        {isSubmitting ? (
                            <div className="spinner-border spinner-border-sm text-light" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <i className="bi bi-shield-check"></i> Sign In as Admin
                            </>
                        )}
                    </button>
                </motion.form>

                {/* Footer links */}
                <div className="text-center mt-4 small text-muted d-flex flex-column gap-2">
                    <div className="border-top pt-3">
                        <Link
                            to="/login"
                            className="text-muted text-decoration-none d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '12px', opacity: 0.7 }}
                        >
                            <i className="bi bi-arrow-left"></i> Back to Student / Staff Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
