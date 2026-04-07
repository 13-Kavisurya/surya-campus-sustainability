import React from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiUnlock, FiSave, FiCheckCircle } from 'react-icons/fi';

const SystemSettings = () => {
    return (
        <div className="admin-content-fade">
             <header className="mb-5">
                <h1 className="h3 fw-bold text-dark display-font mb-2">System Configuration</h1>
                <p className="text-muted">Global environment variables and orchestration parameters.</p>
            </header>

            <div className="row">
                <div className="col-lg-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-eco p-5 border-0 shadow-sm"
                    >
                        <div className="mb-5">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <FiUnlock className="text-primary" /> Access Control
                            </h5>
                            <div className="bg-light p-4 rounded-4 mb-3 border border-dashed shadow-sm">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="fw-bold text-dark">Global Student Registration</div>
                                        <small className="text-muted">Allow non-invite users to create student profiles</small>
                                    </div>
                                    <div className="form-check form-switch fs-4">
                                        <input className="form-check-input" type="checkbox" defaultChecked />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-light p-4 rounded-4 border border-dashed shadow-sm">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="fw-bold text-dark">Manual Staff Verification</div>
                                        <small className="text-muted">Staff accounts require admin approval before login</small>
                                    </div>
                                    <div className="form-check form-switch fs-4">
                                        <input className="form-check-input" type="checkbox" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-5">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <FiBell className="text-warning" /> Notification Engine
                            </h5>
                            <div className="bg-light p-4 rounded-4 border border-dashed shadow-sm">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <div className="fw-bold text-dark">Admin Daily Digest</div>
                                        <small className="text-muted">Email summary of all platform activity at 00:00 UTC</small>
                                    </div>
                                    <div className="form-check form-switch fs-4">
                                        <input className="form-check-input" type="checkbox" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-4 border-top">
                            <div className="text-success small fw-bold d-flex align-items-center gap-2">
                                <FiCheckCircle /> Settings match current live environment
                            </div>
                            <button className="btn-eco-primary px-5 py-2 fw-bold d-flex align-items-center gap-2 border-0 shadow-sm">
                                <FiSave /> Persist Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
                <div className="col-lg-4">
                    <div className="card-eco p-4 border-0 bg-primary-light border-start border-primary border-4 shadow-sm">
                        <h6 className="fw-bold text-primary mb-3 text-uppercase small">Config Notice</h6>
                        <p className="small text-dark mb-0">Changes to global settings may take up to 60 seconds to propagate across all cached server instances.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SystemSettings;
