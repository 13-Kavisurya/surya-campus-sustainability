import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user } = useAuth();

    return (
        <>
            <div className="max-w-3xl mx-auto">
                <div className="mb-4">
                    <h2 className="display-font fw-bold text-dark mb-1">My Profile</h2>
                    <p className="text-muted">Manage your personal information.</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card border-0 shadow-sm panel-glass overflow-hidden"
                >
                    <div className="bg-success pt-5 pb-5 px-4 position-relative">
                        <div className="position-absolute" style={{bottom: '-40px', left: '30px'}}>
                            <div className="bg-white rounded-circle border shadow d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                                <i className="bi bi-person text-success" style={{ fontSize: '3rem' }}></i>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card-body pt-5 px-4 pb-4 mt-3">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Full Name</label>
                                <div className="p-3 bg-light rounded border-0 fw-medium">{user?.name}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Email Address</label>
                                <div className="p-3 bg-light rounded border-0 fw-medium">{user?.email}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Role / Type</label>
                                <div className="p-3 bg-light rounded border-0 fw-medium text-capitalize">{user?.user_type}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small text-uppercase fw-bold">Account Status</label>
                                <div className="p-3 bg-light rounded border-0 fw-medium text-success d-flex align-items-center"><i className="bi bi-check-circle-fill me-2"></i> Active</div>
                            </div>
                        </div>
                        
                        <div className="mt-5 pt-4 border-top">
                            <button className="btn btn-outline-danger fw-bold rounded-pill px-4">
                                <i className="bi bi-key me-2"></i>Reset Password
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Profile;

