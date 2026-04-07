import React from 'react';
import { motion } from 'framer-motion';
import { FiDatabase, FiAlertCircle, FiDownload, FiTrash2, FiCpu } from 'react-icons/fi';

const DatabaseManagement = () => {
    return (
        <div className="admin-content-fade">
             <header className="mb-5">
                <h1 className="h3 fw-bold text-dark display-font mb-2">Engine & Database Control</h1>
                <p className="text-muted">Direct oversight and maintenance of the core platform persistence layer.</p>
            </header>

            <div className="row g-4">
                <div className="col-lg-7">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-eco p-5 border-0 shadow-sm"
                    >
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-danger-light text-danger p-3 rounded-circle shadow-sm">
                                <FiDatabase size={30} />
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0">System Persistence Layer</h4>
                                <p className="text-muted small mb-0">Direct manipulation of backend data collections</p>
                            </div>
                        </div>

                        <div className="alert alert-warning border-0 shadow-sm d-flex gap-3 p-4 mb-5 rounded-4">
                            <FiAlertCircle className="flex-shrink-0 mt-1" size={20} />
                            <div>
                                <strong className="d-block mb-1">Administrative Warning</strong>
                                <span className="small">These operations bypass standard application logic and directly interact with the database drivers. Structural data loss is irreversible.</span>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <div className="bg-light p-4 rounded-4 border d-flex align-items-center justify-content-between hover-shadow transition-all pointer shadow-sm">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white p-2 rounded-3 shadow-sm text-primary border"><FiDownload /></div>
                                    <div>
                                        <div className="fw-bold text-dark">Full Schema Backup</div>
                                        <small className="text-muted">Export all collections to encrypted JSON</small>
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary btn-sm px-4 rounded-pill fw-bold border-2">Execute</button>
                            </div>
                            
                            <div className="bg-light p-4 rounded-4 border d-flex align-items-center justify-content-between hover-shadow transition-all pointer shadow-sm">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white p-2 rounded-3 shadow-sm text-danger border"><FiTrash2 /></div>
                                    <div>
                                        <div className="fw-bold text-dark">Purge Transient Logs</div>
                                        <small className="text-muted">Clear audit trail older than 90 session cycles</small>
                                    </div>
                                </div>
                                <button className="btn btn-outline-danger btn-sm px-4 rounded-pill fw-bold border-2">Execute</button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="col-lg-5">
                    <div className="card-eco p-4 border-0 shadow-sm h-100">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                            <FiCpu className="text-info" /> Performance Health
                        </h5>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="small fw-bold">Storage Occupancy</span>
                                <span className="small text-muted">24%</span>
                            </div>
                            <div className="progress rounded-pill shadow-sm" style={{height: '8px', backgroundColor: '#e9ecef'}}>
                                <div className="progress-bar bg-success rounded-pill" style={{width: '24%'}}></div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="small fw-bold">Query Latency</span>
                                <span className="small text-muted">14ms</span>
                            </div>
                            <div className="progress rounded-pill shadow-sm" style={{height: '8px', backgroundColor: '#e9ecef'}}>
                                <div className="progress-bar bg-info rounded-pill" style={{width: '15%'}}></div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-light rounded-4 border border-dashed mt-auto">
                            <code className="small text-muted d-block mb-2">db.serverStatus().mem</code>
                            <div className="d-flex justify-content-between">
                                <span className="small font-monospace">resident: 45MB</span>
                                <span className="small font-monospace">virtual: 128MB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DatabaseManagement;
