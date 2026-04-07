import React, { useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const MonthlyReports = () => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [sendResult, setSendResult] = useState(null);

    const handlePreview = async () => {
        setLoading(true);
        setSendResult(null);
        try {
            const { data } = await api.get('/admin/monthly-report-preview');
            setPreview(data);
        } catch (err) {
            alert('Failed to load preview: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSendReport = async () => {
        if (!window.confirm('Send monthly report to ALL users? This will send emails to everyone in the portal.')) {
            return;
        }

        setLoading(true);
        setSendResult(null);
        try {
            const { data } = await api.post('/admin/send-monthly-report');
            setSendResult({ success: true, message: data.message });
            alert('Monthly reports sent successfully!');
        } catch (err) {
            setSendResult({
                success: false,
                message: err.response?.data?.message || 'Failed to send reports. Check email configuration in .env file.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container-fluid max-w-4xl mx-auto px-0">
                <div className="mb-5">
                    <h1 className="display-font fw-bold text-dark mb-2">Broadcast Center</h1>
                    <p className="text-muted">Distribute monthly sustainability benchmarks and optimization directives to the entire campus.</p>
                </div>

                <div className="card-eco p-4 p-md-5 mb-4 position-relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="position-absolute top-0 end-0 bg-success opacity-10 rounded-circle" style={{ width: '300px', height: '300px', transform: 'translate(30%, -30%)', filter: 'blur(40px)' }}></div>
                    
                    <div className="d-flex align-items-center gap-4 mb-5 position-relative z-1">
                        <div className="bg-success bg-opacity-10 rounded d-flex align-items-center justify-content-center border border-success border-opacity-25" style={{ width: '64px', height: '64px' }}>
                            <i className="bi bi-inbox-fill text-success fs-3"></i>
                        </div>
                        <div>
                            <h3 className="fw-bold text-dark mb-1">Monthly Broadcast Dispatch</h3>
                            <p className="text-muted fw-bold text-uppercase small mb-0" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>
                                Audit Period: {preview?.period || 'Current Cycle'}
                            </p>
                        </div>
                    </div>

                    <div className="d-flex flex-column flex-md-row gap-3 position-relative z-1">
                        <button
                            onClick={handlePreview}
                            disabled={loading}
                            className="btn btn-light border flex-grow-1 py-3 text-uppercase fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                            style={{ fontSize: '0.85rem', letterSpacing: '1px' }}
                        >
                            <i className="bi bi-eye"></i> Preview System Metrics
                        </button>
                        <button
                            onClick={handleSendReport}
                            disabled={loading}
                            className="btn btn-eco-primary flex-grow-1 py-3 text-uppercase fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                            style={{ fontSize: '0.85rem', letterSpacing: '1px' }}
                        >
                            <i className="bi bi-send-fill"></i> Initiate Global Dispatch
                        </button>
                    </div>
                </div>

                {sendResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`alert ${sendResult.success ? 'alert-success border-success text-success' : 'alert-danger border-danger text-danger'} d-flex align-items-center gap-3 mb-4 shadow-sm border-start border-4 border-end-0 border-top-0 border-bottom-0`}
                    >
                        <i className={`bi ${sendResult.success ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-3`}></i>
                        <div>
                            <h6 className="fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                Transmission Status: {sendResult.success ? 'Completed' : 'Encryption Failure'}
                            </h6>
                            <p className="mb-0 fw-medium small text-dark opacity-75">{sendResult.message}</p>
                        </div>
                    </motion.div>
                )}

                {preview && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-eco p-4 p-md-5 mb-4"
                    >
                        <h6 className="text-muted fw-bold text-uppercase mb-4 flex align-items-center gap-2 border-bottom pb-3" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
                            <i className="bi bi-file-earmark-bar-graph-fill text-success"></i> Audit Artifact Preview
                        </h6>

                        {/* Top 3 Metrics */}
                        <div className="row g-4 mb-5">
                            <div className="col-12 col-md-4">
                                <div className="bg-success bg-opacity-10 border border-success border-opacity-25 rounded p-4 h-100 text-success">
                                    <i className="bi bi-graph-down-arrow fs-2 mb-3 d-block"></i>
                                    <p className="fw-bold text-uppercase small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Impact Mitigation</p>
                                    <h2 className="display-6 fw-bolder mb-0">-{preview.totalReduction.toFixed(1)} <small className="fs-6 opacity-75 fw-normal text-uppercase">Units</small></h2>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded p-4 h-100 text-warning">
                                    <i className="bi bi-graph-up-arrow fs-2 mb-3 d-block"></i>
                                    <p className="fw-bold text-uppercase small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Overusage Load</p>
                                    <h2 className="display-6 fw-bolder mb-0">{preview.avgOverusage}%</h2>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded p-4 h-100 text-primary">
                                    <i className="bi bi-check-circle-fill fs-2 mb-3 d-block"></i>
                                    <p className="fw-bold text-uppercase small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Resolved Alerts</p>
                                    <h2 className="display-6 fw-bolder mb-0">{preview.issuesResolved}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Resource Dimensionality */}
                        <div className="mb-2">
                            <h6 className="text-secondary opacity-50 fw-bold text-uppercase border-bottom pb-3 mb-4" style={{ fontSize: '0.75rem', letterSpacing: '2px' }}>Resource Dimensionality</h6>
                            {Object.keys(preview.resourceBreakdown).length === 0 ? (
                                <div className="text-center py-5 text-muted fst-italic">
                                    No resolved issues identified in the previous month cycle.
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {Object.entries(preview.resourceBreakdown).map(([resource, data]) => (
                                        <div key={resource} className="rounded border bg-light p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow-sm hover-lift">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-white rounded border shadow-sm d-flex align-items-center justify-content-center text-dark fw-bolder fs-5" style={{ width: '48px', height: '48px' }}>
                                                    {resource.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold text-dark text-uppercase mb-1">{resource}</h6>
                                                    <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>{data.count} Critical Points</span>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <div className="bg-white border rounded px-3 py-2 text-center" style={{ minWidth: '100px' }}>
                                                    <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Reduction</small>
                                                    <strong className="text-success fs-6">-{data.reduction.toFixed(1)}</strong>
                                                </div>
                                                <div className="bg-white border rounded px-3 py-2 text-center" style={{ minWidth: '100px' }}>
                                                    <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Efficiency</small>
                                                    <strong className="text-dark fs-6">{data.overusage.toFixed(1)}%</strong>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="card-eco bg-dark text-light p-4 p-md-5 border-0">
                    <h6 className="fw-bold text-uppercase mb-4 flex align-items-center gap-2 border-bottom border-secondary pb-3" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>
                        <i className="bi bi-envelope-check-fill text-success"></i> Telemetry Configuration
                    </h6>
                    <div className="mb-4">
                        <p className="text-secondary fw-medium mb-3">To facilitate global dispatch, ensure credentials are provisioned in the secure <code>server/.env</code> runtime environment:</p>
                        <div className="position-relative">
                            <pre className="bg-black bg-opacity-50 p-4 rounded text-success border border-secondary border-opacity-25" style={{ fontSize: '0.85rem' }}>
{`# SECURE SMTP PROVISIONING
EMAIL_USER=admin@emerald-portal.edu
EMAIL_PASS=X-EMERALD-SECRET-AUTH`}
                            </pre>
                            <div className="position-absolute top-0 end-0 p-3">
                                <div className="bg-success rounded-circle animate-pulse" style={{ width: '8px', height: '8px', boxShadow: '0 0 10px #10b981' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-success bg-opacity-10 border border-success border-opacity-25 rounded p-3 text-success small">
                        <strong>NOTICE:</strong> If utilizing external relay services (e.g. Gmail), mandated MFA requires App-Specific token generation. Standard authentication protocols may be deprecated.
                    </div>
                </div>
            </div>
        </>
    );
};

export default MonthlyReports;

