import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import Loader from '../../components/UI/Loader';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const [tips, setTips] = useState([
        "Turn off lights when leaving the room.",
        "Use reusable water bottles to reduce plastic waste.",
        "Report leaking taps immediately to save water.",
        "Unplug electronics when not in use."
    ]);

    return (
        <div className="fade-in-up">
            <div className="mb-4">
                <h2 className="display-font fw-bold text-dark mb-1" style={{ fontSize: '1.5rem' }}>Student Dashboard</h2>
                <p className="text-secondary text-small">Welcome back. Here's your sustainability overview.</p>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { title: 'Report Issue', desc: 'Identify resource waste around campus.', icon: 'bi-megaphone', color: 'success', link: '/student/report', btn: 'Submit' },
                    { title: 'My Reports', desc: 'Track your reported sustainability issues.', icon: 'bi-file-earmark-text', color: 'primary', link: '/student/my-reports', btn: 'View' },
                    { title: 'Learn More', desc: 'Tips for a greener campus daily life.', icon: 'bi-lightbulb', color: 'warning', link: '#', btn: 'Read' }
                ].map((item, idx) => (
                    <div className="col-md-4" key={idx}>
                        <motion.div 
                            whileHover={{ y: -4 }}
                            className="glass-card hover-lift h-100 p-4 d-flex flex-column align-items-center text-center border-0 shadow-sm"
                        >
                            <div className={`bg-${item.color} text-white rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm`} style={{ width: '48px', height: '48px' }}>
                                <i className={`bi ${item.icon} fs-5`}></i>
                            </div>
                            <h6 className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>{item.title}</h6>
                            <p className="text-muted text-small mb-3">{item.desc}</p>
                            <a href={item.link} className={`btn btn-eco-primary w-100 mt-auto shadow-sm btn-sm`} style={{ backgroundColor: `var(--bs-${item.color})`, border: 'none' }}>
                                {item.btn}
                            </a>
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="glass-card p-4 border-0 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="bg-success-light p-2 rounded">
                        <i className="bi bi-stars text-success"></i>
                    </div>
                    <h6 className="fw-bold mb-0">Daily Sustainability Tips</h6>
                </div>
                <div className="row g-3">
                    {tips.map((tip, index) => (
                        <div className="col-md-6" key={index}>
                            <div className="p-3 rounded-3 bg-light/50 border d-flex align-items-center gap-3 hover-lift transition-all">
                                <div className="bg-white rounded-circle border shadow-sm d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                                    <i className="bi bi-check2 text-success fw-bold"></i>
                                </div>
                                <span className="text-small fw-medium text-dark">{tip}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

