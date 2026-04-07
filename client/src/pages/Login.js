import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
            
            // Handle redirection search parameter
            const params = new URLSearchParams(window.location.search);
            const redirectPath = params.get('redirect');
            
            // Re-fetch or check user type from localStorage since it might be updated in the context
            const userType = JSON.parse(localStorage.getItem('user'))?.user_type;

            if (userType === 'staff') {
                // Managers (staff) always go to their dashboard when coming from QR
                navigate('/staff/dashboard');
            } else if (redirectPath && redirectPath.startsWith('/')) {
                navigate(redirectPath);
            } else {
                navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid credentials. Access denied.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative bg-eco-pattern px-3" style={{ backgroundColor: 'var(--eco-bg)' }}>
            {/* Soft decorative background circles */}
            <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <div className="position-absolute rounded-circle" style={{
                    width: '600px', height: '600px', top: '-10%', left: '-10%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />
                <div className="position-absolute rounded-circle" style={{
                    width: '500px', height: '500px', bottom: '-10%', right: '-10%',
                    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass-card p-4 p-md-5 position-relative z-1 border-0 shadow-2xl"
                style={{ width: '100%', maxWidth: '440px' }}
            >
                <div className="text-center mb-4">
                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '56px', height: '56px' }}>
                        <i className="bi bi-tree-fill fs-3"></i>
                    </div>
                    <h2 className="fw-bold display-font text-dark mb-1">Welcome Back</h2>
                    <p className="text-muted small">Campus Sustainability Platform</p>
                </div>

                {/* Error handled by Toast */}

                <motion.form 
                    key="email-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                >
                    <div className="mb-3 position-relative">
                        <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control-eco w-100 ps-5"
                            required
                        />
                    </div>

                    <div className="mb-4 position-relative">
                        <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control-eco w-100 ps-5 pe-5"
                            required
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

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-eco-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="spinner-border spinner-border-sm text-light" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        ) : (
                            <>
                                Sign In <i className="bi bi-arrow-right"></i>
                            </>
                        )}
                    </button>
                </motion.form>

                <div className="text-center mt-4 small text-muted d-flex flex-column gap-2">
                    <div>
                        <span>Don't have an account?</span>
                        <Link to="/register" className="text-success fw-bold ms-1 text-decoration-none">Create one</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
