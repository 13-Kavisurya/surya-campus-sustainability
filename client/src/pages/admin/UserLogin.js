import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';

const PasswordInput = ({ value, onChange, placeholder = 'Password', required = true }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="position-relative">
            <FiLock className="position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }} />
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
                {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
        </div>
    );
};

const UserLogin = () => {
    const [tab, setTab] = useState('login');

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginSubmitting, setLoginSubmitting] = useState(false);

    // Register state
    const [regData, setRegData] = useState({ name: '', email: '', password: '', user_type: 'student' });
    const [regError, setRegError] = useState('');
    const [regSubmitting, setRegSubmitting] = useState(false);
    const [regSuccess, setRegSuccess] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginSubmitting(true);
        try {
            await login(loginEmail, loginPassword);
            navigate('/');
        } catch (err) {
            setLoginError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');
        setRegSubmitting(true);
        try {
            await register(regData.name, regData.email, regData.password, regData.user_type);
            setRegSuccess('Account created! Redirecting...');
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            setRegError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setRegSubmitting(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="card-eco p-5 shadow-sm"
                style={{ width: '100%', maxWidth: '480px' }}
            >
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '56px', height: '56px' }}>
                        <i className="bi bi-people-fill fs-4"></i>
                    </div>
                    <h4 className="fw-bold display-font text-dark mb-1">User Portal</h4>
                    <p className="text-muted small">Login or register as a student / staff member</p>
                </div>

                {/* Tabs */}
                <div className="d-flex rounded-3 overflow-hidden border mb-4" style={{ background: '#f8f9fa' }}>
                    <button
                        className={`flex-fill py-2 fw-bold border-0 transition-all ${tab === 'login' ? 'bg-success text-white shadow-sm' : 'bg-transparent text-muted'}`}
                        style={{ fontSize: '0.88rem' }}
                        onClick={() => setTab('login')}
                    >
                        <FiLogIn className="me-2" />Sign In
                    </button>
                    <button
                        className={`flex-fill py-2 fw-bold border-0 transition-all ${tab === 'register' ? 'bg-success text-white shadow-sm' : 'bg-transparent text-muted'}`}
                        style={{ fontSize: '0.88rem' }}
                        onClick={() => setTab('register')}
                    >
                        <FiUserPlus className="me-2" />Register
                    </button>
                </div>

                {/* LOGIN FORM */}
                {tab === 'login' && (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {loginError && (
                            <div className="alert alert-danger py-2 small fw-medium border-0 mb-3">{loginError}</div>
                        )}
                        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
                            <div className="position-relative">
                                <FiMail className="position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className="form-control-eco w-100 ps-5"
                                    required
                                />
                            </div>
                            <PasswordInput
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Password"
                            />
                            <button
                                type="submit"
                                disabled={loginSubmitting}
                                className="btn-eco-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 border-0 mt-1"
                            >
                                {loginSubmitting ? (
                                    <div className="spinner-border spinner-border-sm text-light" role="status" />
                                ) : (
                                    <>Sign In <FiLogIn /></>
                                )}
                            </button>
                        </form>
                        <p className="text-center text-muted small mt-3 mb-0">
                            No account?{' '}
                            <button className="btn btn-link p-0 text-success fw-bold small text-decoration-none" onClick={() => setTab('register')}>
                                Create one
                            </button>
                        </p>
                    </motion.div>
                )}

                {/* REGISTER FORM */}
                {tab === 'register' && (
                    <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {regError && (
                            <div className="alert alert-danger py-2 small fw-medium border-0 mb-3">{regError}</div>
                        )}
                        {regSuccess && (
                            <div className="alert alert-success py-2 small fw-medium border-0 mb-3">{regSuccess}</div>
                        )}
                        <form onSubmit={handleRegister} className="d-flex flex-column gap-3">
                            <div className="position-relative">
                                <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }}></i>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={regData.name}
                                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                                    className="form-control-eco w-100 ps-5"
                                    required
                                />
                            </div>
                            <div className="position-relative">
                                <FiMail className="position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 2 }} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={regData.email}
                                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                                    className="form-control-eco w-100 ps-5"
                                    required
                                />
                            </div>
                            <PasswordInput
                                value={regData.password}
                                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                placeholder="Password (min 6 chars)"
                            />
                            <div className="position-relative">
                                <i className="bi bi-briefcase position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}></i>
                                <select
                                    value={regData.user_type}
                                    onChange={(e) => setRegData({ ...regData, user_type: e.target.value })}
                                    className="form-select form-control-eco w-100 ps-5"
                                >
                                    <option value="student">Student</option>
                                    <option value="staff">Staff Member</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={regSubmitting}
                                className="btn-eco-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 border-0 mt-1"
                            >
                                {regSubmitting ? (
                                    <div className="spinner-border spinner-border-sm text-light" role="status" />
                                ) : (
                                    <>Create Account <FiUserPlus /></>
                                )}
                            </button>
                        </form>
                        <p className="text-center text-muted small mt-3 mb-0">
                            Already registered?{' '}
                            <button className="btn btn-link p-0 text-success fw-bold small text-decoration-none" onClick={() => setTab('login')}>
                                Sign in
                            </button>
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default UserLogin;
