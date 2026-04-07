import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SustainabilityAnalytics = () => {
    const [reports, setReports] = useState([]);
    const [usage, setUsage] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportsRes, usageRes] = await Promise.all([
                    api.get('/reports'),
                    api.get('/usage')
                ]);
                setReports(reportsRes.data.reports || []);
                setUsage(usageRes.data.usageData || []);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getCountByType = (type) => reports.filter(r => r.report_type === type).length;
    const getUsageByResource = (type) => usage.filter(u => u.resourceType === type);
    
    const resourceSummaries = [
        { name: 'Electricity', icon: 'zap', color: 'warning', unit: 'kWh', metric: 'unitsConsumed' },
        { name: 'Water', icon: 'droplet', color: 'info', unit: 'litres', metric: 'meterReading' },
        { name: 'Waste', icon: 'trash2', color: 'danger', unit: 'kg', metric: 'volume' },
        { name: 'Transport', icon: 'repeat', color: 'success', unit: 'km', metric: 'distanceCovered' }
    ];

    const reportCategories = [
        { name: 'Waste', label: 'Waste Management', type: 'waste', color: 'danger', hex: '#dc3545' },
        { name: 'Water', label: 'Water Leak / Usage', type: 'water', color: 'info', hex: '#0dcaf0' },
        { name: 'Energy', label: 'Energy / Electricity', type: 'energy', color: 'warning', hex: '#ffc107' },
        { name: 'Suggestions', label: 'Green Suggestions', type: 'suggestion', color: 'success', hex: '#198754' }
    ];

    const pieData = reportCategories.map(cat => ({
        name: cat.name,
        value: getCountByType(cat.type),
        color: cat.hex
    })).filter(d => d.value > 0);

    return (
        <>
            <div className="mb-4">
                <h2 className="display-font fw-bold text-dark mb-1">Sustainability Analytics</h2>
                <p className="text-muted mb-0">Unified insights from resource consumption and community reports.</p>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : (
                <div className="row g-4">
                    {/* Resource Usage Section */}
                    {resourceSummaries.map((res, idx) => {
                        const logs = getUsageByResource(res.name);
                        const totalUnits = logs.reduce((acc, curr) => acc + (parseFloat(curr.metrics[res.metric]) || 0), 0);
                        const totalCost = logs.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
                        
                        return (
                            <div className="col-md-3" key={res.name}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="card border-0 shadow-sm panel-glass p-3 h-100"
                                >
                                    <div className={`d-flex align-items-center gap-2 mb-2 text-${res.color}`}>
                                        <i className={`bi bi-${res.icon} fs-5`}></i>
                                        <span className="small fw-bold text-uppercase">{res.name}</span>
                                    </div>
                                    <h3 className="fw-bold text-dark mb-0">{totalUnits.toLocaleString()}</h3>
                                    <small className="text-muted fw-medium">{res.unit} logged</small>
                                    <div className="mt-2 pt-2 border-top">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">Total Cost:</small>
                                            <span className="fw-bold text-dark">${totalCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}

                    <div className="col-lg-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card shadow-sm border-0 panel-glass p-4 h-100">
                            <h5 className="fw-bold mb-4">Report Distribution</h5>
                            
                            <div className="row align-items-center">
                                <div className="col-md-6 order-2 order-md-1">
                                    <div className="d-flex flex-column gap-3">
                                        {reportCategories.map(item => (
                                            <div key={item.type}>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="fw-medium text-dark small">{item.label}</span>
                                                    <span className={`fw-bold text-${item.color} small`}>
                                                        {getCountByType(item.type)} ({reports.length > 0 ? Math.round((getCountByType(item.type) / reports.length) * 100) : 0}%)
                                                    </span>
                                                </div>
                                                <div className="progress rounded-pill shadow-none bg-light" style={{ height: '6px' }}>
                                                    <div 
                                                        className={`progress-bar bg-${item.color}`} 
                                                        style={{ width: `${(getCountByType(item.type) / Math.max(reports.length, 1)) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-6 order-1 order-md-2 mb-4 mb-md-0 d-flex justify-content-center" style={{ height: '220px' }}>
                                    {reports.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
                                                    cursor={{ stroke: 'none' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-muted d-flex align-items-center justify-content-center h-100">
                                            <span>No report data to visualize</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="col-lg-4">
                        <div className="d-flex flex-column gap-4 h-100">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card shadow-sm border-0 bg-success text-white p-4 flex-grow-1 feature-card">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0">Resolution Rate</h6>
                                    <i className="bi bi-graph-up-arrow fs-3 opacity-50"></i>
                                </div>
                                <h1 className="display-5 fw-bold mb-0">
                                    {reports.length > 0 ? Math.round((reports.filter(r => r.status === 'resolved').length / reports.length) * 100) : 0}%
                                </h1>
                                <p className="mb-0 opacity-75 small mt-2">Overall efficiency in handling campus issues.</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card shadow-sm border-0 bg-dark text-white p-4 flex-grow-1 feature-card">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0">Active Users</h6>
                                    <i className="bi bi-people fs-3 opacity-50"></i>
                                </div>
                                <h1 className="display-5 fw-bold mb-0">{[...new Set(reports.map(r => r.user_id))].length}</h1>
                                <p className="mb-0 opacity-75 small mt-2">Unique contributors this month.</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SustainabilityAnalytics;

