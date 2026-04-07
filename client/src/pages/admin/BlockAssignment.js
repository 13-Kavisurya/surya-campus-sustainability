import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { FiSave, FiMapPin, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const BlockAssignment = () => {
    const [assignments, setAssignments] = useState([]);
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Predefined campus blocks from the user's requirements
    const blocks = [
        'SF Block', 'AS Block', 'IB Block', 'MECH Block',
        'Research Park', 'Learning Centre', 'Medical Centre',
        'Girls Hostel', 'Boys Hostel', 'Cafeteria'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsRes, coordinatorsRes] = await Promise.all([
                api.get('/admin/block-assignments'),
                api.get('/admin/coordinators')
            ]);
            
            // Transform assignments into a lookup object for easier form management
            const assignmentMap = {};
            assignmentsRes.data.forEach(asgn => {
                assignmentMap[asgn.location] = asgn.coordinator_id?._id || asgn.coordinator_id;
            });
            
            setAssignments(assignmentMap);
            setCoordinators(coordinatorsRes.data);
        } catch (error) {
            console.error("Error fetching assignment data:", error);
            setMessage({ type: 'danger', text: 'Failed to load data. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (location, coordinator_id) => {
        if (!coordinator_id) return;
        
        try {
            setSubmitting(location); // Use location to show which row is saving
            await api.post('/admin/block-assignments', {
                location,
                coordinator_id
            });
            
            setAssignments(prev => ({
                ...prev,
                [location]: coordinator_id
            }));
            
            setMessage({ type: 'success', text: `Assigned coordinator to ${location} successfully!` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error updating assignment:", error);
            setMessage({ type: 'danger', text: 'Failed to update assignment.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Block Coordinator Assignments</h2>
                    <p className="text-muted mb-0">Map campus blocks to specific staff members for report resolution.</p>
                </div>
            </div>

            {message.text && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`alert alert-${message.type} d-flex align-items-center gap-2 shadow-sm rounded-3 mb-4`}
                >
                    {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                    {message.text}
                </motion.div>
            )}

            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 border-0" style={{ width: '30%' }}>Campus Block</th>
                                    <th className="py-3 border-0">Assigned Coordinator</th>
                                    <th className="py-3 border-0 text-end pe-4" style={{ width: '15%' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blocks.map((block) => (
                                    <tr key={block}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light rounded-3 p-2">
                                                    <FiMapPin className="text-primary" />
                                                </div>
                                                <span className="fw-bold text-dark">{block}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light rounded-pill p-2">
                                                    <FiUser className="text-muted" />
                                                </div>
                                                <select 
                                                    className="form-select border-0 bg-light rounded-3 fw-medium"
                                                    value={assignments[block] || ''}
                                                    onChange={(e) => setAssignments(prev => ({ ...prev, [block]: e.target.value }))}
                                                    style={{ maxWidth: '300px' }}
                                                >
                                                    <option value="">Select Coordinator...</option>
                                                    {coordinators.map(coord => (
                                                        <option key={coord._id} value={coord._id}>
                                                            {coord.name} ({coord.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="py-3 text-end pe-4">
                                            <button 
                                                className={`btn ${submitting === block ? 'btn-secondary' : 'btn-primary'} rounded-pill px-4 d-flex align-items-center gap-2 ms-auto`}
                                                onClick={() => handleAssign(block, assignments[block])}
                                                disabled={submitting === block || !assignments[block]}
                                            >
                                                {submitting === block ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <><FiSave /> Save</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockAssignment;
