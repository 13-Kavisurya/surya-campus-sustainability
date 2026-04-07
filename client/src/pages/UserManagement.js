import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    
    // Edit User State
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditFormData({ name: user.name, email: user.email, role: user.role });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await api.put(`/auth/users/${editingUser._id}`, editFormData);
            setEditingUser(null);
            fetchUsers();
            alert('User updated successfully');
        } catch (err) {
            alert('Failed to update user');
        } finally {
            setIsUpdating(false);
        }
    };

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role !== 'admin').length;

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
            >
                <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                    <span className="text-secondary fw-bold text-uppercase small" style={{ letterSpacing: '2px', fontSize: '0.7rem' }}>Administrative Control</span>
                </div>
                <h1 className="display-font fw-bold text-dark mb-2">Access Control Center</h1>
                <p className="text-muted" style={{ maxWidth: '600px' }}>
                    Manage campus user accounts, assign administrative roles, and maintain security protocols for the sustainability reporting platform.
                </p>
            </motion.div>

            {/* Stats */}
            <div className="row g-4 mb-5">
                <div className="col-12 col-md-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-eco p-4 d-flex align-items-center justify-content-between h-100">
                        <div>
                            <p className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Users</p>
                            <h2 className="display-5 fw-bolder text-dark mb-0">{users.length}</h2>
                        </div>
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success fs-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-people-fill"></i>
                        </div>
                    </motion.div>
                </div>
                <div className="col-12 col-md-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-eco p-4 d-flex align-items-center justify-content-between h-100">
                        <div>
                            <p className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Administrators</p>
                            <h2 className="display-5 fw-bolder text-dark mb-0">{adminCount}</h2>
                        </div>
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary fs-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Edit User Modal (Simple inline overlay for now) */}
            {editingUser && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3" style={{ backdropFilter: 'blur(4px)' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-eco p-4 p-md-5 w-100 mx-3 shadow-lg" style={{ maxWidth: '500px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h4 className="fw-bold text-dark mb-0">Edit User Details</h4>
                            <button onClick={() => setEditingUser(null)} className="btn-close shadow-none"></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="form-control form-control-eco bg-light"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="form-control form-control-eco bg-light"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>System Role</label>
                                <select
                                    className="form-select form-control-eco bg-light"
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="d-flex gap-2 mt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-light fw-bold flex-grow-1 border shadow-sm">Cancel</button>
                                <button type="submit" disabled={isUpdating} className="btn btn-eco-primary fw-bold flex-grow-1 shadow-sm">
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Users Table */}
            <div className="card-eco overflow-hidden mb-5 position-relative z-1">
                <div className="p-4 border-bottom bg-light bg-opacity-50">
                    <h5 className="fw-bold text-dark mb-1">Registered Accounts</h5>
                    <p className="text-muted small mb-0">Monitor and manage all campus portal users</p>
                </div>

                {loading ? (
                    <div className="py-5 text-center">
                        <div className="spinner-border text-success mb-3" role="status"></div>
                        <p className="text-muted fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Loading user directory...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-5 text-center px-3">
                        <i className="bi bi-people text-muted opacity-50 mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="fw-bold text-dark">No users found</h5>
                        <p className="text-muted">Register new users to begin managing accounts</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Profile</th>
                                    <th className="text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Role</th>
                                    <th className="text-uppercase text-muted text-end" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, idx) => (
                                    <motion.tr
                                        key={u._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <td>
                                            <div className="d-flex align-items-center gap-3 py-2 px-3">
                                                <div className="position-relative">
                                                    <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center border border-success border-opacity-25" style={{ width: '48px', height: '48px' }}>
                                                        <i className="bi bi-person-circle fs-4 text-success"></i>
                                                    </div>
                                                    {u.role === 'admin' && (
                                                        <div className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle d-flex align-items-center justify-content-center border border-white" style={{ width: '20px', height: '20px' }}>
                                                            <i className="bi bi-shield-check" style={{ fontSize: '0.65rem' }}></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-0">{u.name}</h6>
                                                    <small className="text-muted">{u.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${
                                                u.role === 'admin'
                                                    ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
                                                    : u.role === 'manager' 
                                                    ? 'bg-info bg-opacity-10 text-info border border-info border-opacity-25' 
                                                    : 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'
                                            } d-inline-flex align-items-center gap-1`}>
                                                <i className={`bi ${u.role === 'admin' ? 'bi-shield-check' : u.role === 'manager' ? 'bi-person-gear' : 'bi-person'}`}></i>
                                                <span className="text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>
                                                    {u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Manager' : 'User'}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="text-end px-3">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button
                                                    onClick={() => handleCopyId(u._id)}
                                                    className="btn btn-sm btn-light border shadow-sm text-secondary"
                                                    title="Copy User ID"
                                                >
                                                    {copiedId === u._id ? <i className="bi bi-check-circle-fill text-success"></i> : <i className="bi bi-copy"></i>}
                                                </button>

                                                <button
                                                    onClick={() => handleEditUser(u)}
                                                    className="btn btn-sm btn-outline-primary shadow-sm"
                                                    title="Edit user"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    disabled={u.role === 'admin'}
                                                    className="btn btn-sm btn-outline-danger shadow-sm"
                                                    title={u.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Box */}
            {!loading && users.length > 0 && (
                <div className="alert alert-info d-flex align-items-start gap-3 border-0 bg-primary bg-opacity-10 rounded-4 p-4 position-relative z-1">
                    <i className="bi bi-info-circle-fill text-primary fs-4 mt-1"></i>
                    <div>
                        <h6 className="fw-bold text-dark mb-1">Administrative Privileges</h6>
                        <p className="text-muted small mb-0">Only administrators can access the admin dashboard and manage system settings. User accounts can only delete non-admin users.</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserManagement;

