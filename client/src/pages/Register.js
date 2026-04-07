import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const PasswordInput = ({ value, onChange, placeholder = 'Password', className = '', required = true }) => {
    const [show, setShow] = useState(false);
    return (
        <div className={`position-relative ${className}`}>
            <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }}></i>
            <input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="form-control-eco w-100 ps-5 pe-5"
                required={required}
                minLength={6}
            />
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="position-absolute top-50 translate-middle-y end-0 me-3 border-0 bg-transparent text-muted p-0"
                style={{ zIndex: 2 }}
                tabIndex={-1}
            >
                <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
        </div>
    );
};

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        user_type: 'student'
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await register(formData.name, formData.email, formData.password, formData.user_type);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative" style={{ backgroundColor: 'var(--eco-bg)' }}>
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="card-eco p-5 position-relative z-1"
                style={{ width: '100%', maxWidth: '420px' }}
            >
                <div className="text-center mb-4">
                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '56px', height: '56px' }}>
                        <i className="bi bi-person-plus-fill fs-3"></i>
                    </div>
                    <h2 className="fw-bold display-font text-dark mb-1">Create Account</h2>
                    <p className="text-muted small">Join our sustainability mission</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small fw-medium" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3 position-relative">
                        <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="form-control-eco w-100 ps-5"
                            required
                        />
                    </div>

                    <div className="mb-3 position-relative">
                        <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="form-control-eco w-100 ps-5"
                            required
                        />
                    </div>

                    <PasswordInput
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password (min 6 chars)"
                        className="mb-3"
                    />

                    <div className="mb-4 position-relative">
                        <i className="bi bi-briefcase position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}></i>
                        <select
                            value={formData.user_type}
                            onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                            className="form-select form-control-eco w-100 ps-5"
                        >
                            <option value="student">Student</option>
                            <option value="staff">Staff Member</option>
                        </select>
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
                            <>Register <i className="bi bi-arrow-right"></i></>
                        )}
                    </button>
                </form>

                <div className="text-center mt-4 small text-muted">
                    <span>Already have an account?</span>
                    <Link to="/login" className="text-success fw-bold ms-1 text-decoration-none">Sign In</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
