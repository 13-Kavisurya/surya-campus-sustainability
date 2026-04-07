import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { FiSmartphone, FiEdit2, FiRepeat } from 'react-icons/fi';

const LoginQrCode = () => {
    const [hostname, setHostname] = useState(window.location.hostname);
    const [port] = useState(window.location.port);
    const [protocol] = useState(window.location.protocol);
    const [showEdit, setShowEdit] = useState(false);
    
    // Automatically flag if it's localhost
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const loginUrl = `${baseUrl}/login?redirect=/student/report`;

    return (
        <div className="admin-content-fade min-vh-100 d-flex flex-column align-items-center justify-content-center py-5">
            <header className="mb-4 text-center">
                <h1 className="h3 fw-bold text-dark display-font mb-2">Student Login Portal QR</h1>
                <p className="text-muted">Users can scan this code with their smartphone to open the login page directly.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-eco p-4 p-md-5 border-0 shadow text-center d-flex flex-column align-items-center"
                style={{ maxWidth: '400px', width: '100%' }}
            >
                {isLocalhost && !showEdit && (
                    <div className="alert alert-warning py-2 mb-3 small d-flex align-items-center gap-2 rounded-3 border-0 shadow-sm" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#856404' }}>
                        <i className="bi bi-info-circle-fill"></i>
                        <span>Using <b>localhost</b>. Phones cannot scan this!</span>
                        <button className="btn btn-sm p-1 ms-auto" onClick={() => setShowEdit(true)} title="Change IP">
                            <FiEdit2 size={14} />
                        </button>
                    </div>
                )}

                {showEdit && (
                    <div className="mb-4 w-100 animate-in slide-in-from-top-4 duration-300">
                        <label className="small fw-bold text-muted text-uppercase d-block mb-2">Change to Laptop IP</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white border-end-0 pe-1">{protocol}//</span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-1 py-2 fw-medium"
                                placeholder="e.g. 192.168.1.5"
                                value={hostname}
                                onChange={(e) => setHostname(e.target.value)}
                            />
                            <button className="btn btn-outline-success border-0 px-3" onClick={() => setShowEdit(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-sm" style={{ width: '56px', height: '56px' }}>
                    <FiSmartphone size={24} />
                </div>
                
                <div className="bg-white p-3 rounded-4 shadow-sm mb-4 border d-inline-block">
                    <QRCode
                        value={loginUrl}
                        size={250}
                        level="H"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                </div>
                
                <h5 className="fw-bold mb-2 text-dark">Scan to Login</h5>
                <p className="text-muted small mb-0 text-break" style={{ wordBreak: 'break-all' }}>{loginUrl}</p>
                
                <button className="btn btn-link text-success text-decoration-none small mt-3 fw-bold d-flex align-items-center gap-2" onClick={() => setShowEdit(!showEdit)}>
                    <FiRepeat size={14} /> {showEdit ? "Hide Settings" : "Change IP Address"}
                </button>
            </motion.div>
        </div>
    );
};

export default LoginQrCode;
