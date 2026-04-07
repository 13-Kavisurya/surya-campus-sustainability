import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiSearch, FiFilter, FiUserPlus } from 'react-icons/fi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState(-1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', user_type: '', password: '' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormData, setAddFormData] = useState({ name: '', email: '', user_type: 'student', password: '' });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [page, limit, debouncedSearchTerm, sortBy, sortOrder]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users', {
                params: {
                    page,
                    limit,
                    search: debouncedSearchTerm,
                    sortBy,
                    sortOrder
                }
            });
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
            setTotalCount(res.data.totalCount);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 1 ? -1 : 1);
        } else {
            setSortBy(field);
            setSortOrder(1);
        }
        setPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <i className="bi bi-chevron-expand ms-1 text-muted small"></i>;
        return sortOrder === 1 
            ? <i className="bi bi-chevron-up ms-1 text-success small"></i> 
            : <i className="bi bi-chevron-down ms-1 text-success small"></i>;
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/users', addFormData);
            setUsers([res.data, ...users]);
            setShowAddModal(false);
            setAddFormData({ name: '', email: '', user_type: 'student', password: '' });
        } catch (error) {
            console.error('Failed to add user', error);
            alert(error.response?.data?.message || 'Failed to add user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? All their associated reports will remain but the account will be purged.')) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                console.error('Failed to delete user', error);
            }
        }
    };

    const handleUpdate = async (id) => {
        try {
            const dataToUpdate = { ...editFormData };
            // Don't send empty password
            if (!dataToUpdate.password) {
                delete dataToUpdate.password;
            }

            const res = await api.put(`/admin/users/${id}`, dataToUpdate);
            setUsers(users.map(u => u._id === id ? { ...u, ...res.data } : u));
            setEditingUserId(null);
        } catch (error) {
            console.error('Failed to update user', error);
            alert(error.response?.data?.message || 'Failed to update user');
        }
    };

    const startEditing = (user) => {
        setEditingUserId(user._id);
        setEditFormData({
            name: user.name,
            email: user.email,
            user_type: user.user_type,
            password: '' // Keep empty to require explicit setting
        });
    };

    const filteredUsers = users; // Server-side filtering now

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-3 text-muted small fw-bold text-uppercase">Mapping User Base...</p>
        </div>
    );

    return (
        <div className="admin-content-fade">
            <header className="mb-5">
                <h1 className="h3 fw-bold text-dark display-font mb-2">User Discovery & Management</h1>
                <p className="text-muted">Manage system access and monitor user engagement across the campus network.</p>
            </header>

            <div className="row mb-4 g-3">
                <div className="col-md-8">
                    <div className="position-relative">
                        <FiSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input 
                            type="text"
                            className="form-control-eco ps-5"
                            placeholder="Search names, emails, or roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-4 d-flex gap-2">
                    <button className="btn btn-outline-success flex-fill d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm border-2 fw-bold">
                        <FiFilter /> Filter
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-eco-primary flex-fill d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm fw-bold text-nowrap"
                    >
                        <FiUserPlus /> Add User
                    </button>
                    <Link to="/admin/add-admin" className="btn btn-outline-danger flex-fill d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm fw-bold text-nowrap">
                        <FiUserPlus /> Scale Admin
                    </Link>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Register New Account</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <form onSubmit={handleAddUser}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Full Identity</label>
                                        <input type="text" className="form-control" required value={addFormData.name} onChange={e => setAddFormData({...addFormData, name: e.target.value})} placeholder="e.g. Kanishk" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Email Access</label>
                                        <input type="email" className="form-control" required value={addFormData.email} onChange={e => setAddFormData({...addFormData, email: e.target.value})} placeholder="email@campus.com" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Account Security</label>
                                        <input type="text" className="form-control" required value={addFormData.password} onChange={e => setAddFormData({...addFormData, password: e.target.value})} placeholder="Set initial password" />
                                    </div>
                                    <div className="mb-0">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Access Privilege</label>
                                        <select className="form-select" value={addFormData.user_type} onChange={e => setAddFormData({...addFormData, user_type: e.target.value})}>
                                            <option value="student">Student Account</option>
                                            <option value="staff">Coordinator Access</option>
                                            <option value="admin">System Administrator</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0 pb-4 px-4">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold text-muted" onClick={() => setShowAddModal(false)}>Discard</button>
                                    <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">Create Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="card-eco p-0 overflow-hidden border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                    User Identity <SortIcon field="name" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('user_type')}>
                                    Role <SortIcon field="user_type" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
                                    Contact Information <SortIcon field="email" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                                    Joined Date <SortIcon field="created_at" />
                                </th>
                                <th className="px-4 py-3 text-muted small fw-bold text-uppercase border-0 text-end">Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredUsers.map((user, index) => (
                                    <motion.tr 
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {editingUserId === user._id ? (
                                            <>
                                                <td className="px-4 py-3">
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-sm" 
                                                        value={editFormData.name} 
                                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select 
                                                        className="form-select form-select-sm" 
                                                        value={editFormData.user_type} 
                                                        onChange={(e) => setEditFormData({...editFormData, user_type: e.target.value})}
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="staff">Coordinator</option>
                                                        <option value="admin">System Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex flex-column gap-2">
                                                        <input 
                                                            type="email" 
                                                            className="form-control form-control-sm" 
                                                            value={editFormData.email} 
                                                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                                                            placeholder="Email"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm border-warning" 
                                                            value={editFormData.password} 
                                                            onChange={(e) => setEditFormData({...editFormData, password: e.target.value})} 
                                                            placeholder="New Password (Optional)"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted small">
                                                    {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button onClick={() => handleUpdate(user._id)} className="btn btn-success btn-sm border shadow-sm px-3 fw-bold">Save</button>
                                                        <button onClick={() => setEditingUserId(null)} className="btn btn-light btn-sm border shadow-sm px-3 fw-bold text-muted">Cancel</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px', fontSize: '1rem', fontWeight: 'bold' }}>
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <span className="fw-bold text-dark">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`badge rounded-pill px-3 py-2 ${
                                                        user.user_type === 'admin' ? 'bg-danger text-white' : 
                                                        user.user_type === 'staff' ? 'bg-info-light text-info' : 'bg-success-light text-success'
                                                    }`}>
                                                        {user.user_type === 'admin' ? 'System Admin' : user.user_type === 'staff' ? 'Coordinator' : 'Student'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted small">
                                                    <div>{user.email}</div>
                                                    <div className="small text-warning" style={{fontSize: '0.7rem'}}>Password: •••••••• (Encrypted)</div>
                                                </td>
                                                <td className="px-4 py-3 text-muted small">
                                                    {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button onClick={() => startEditing(user)} className="btn btn-light btn-sm text-primary border shadow-sm p-2"><FiEdit2 /></button>
                                                        <button 
                                                            onClick={() => handleDelete(user._id)} 
                                                            className="btn btn-light btn-sm text-danger border shadow-sm p-2"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-5 text-center text-muted italic small fw-bold text-uppercase">
                                        No users matching your search criteria were located.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-4 px-2">
                    <div className="text-muted small fw-bold">
                        Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center gap-1 me-3">
                            <span className="small text-muted fw-bold text-uppercase">Show</span>
                            <select 
                                className="form-select form-select-sm border-0 bg-light rounded-3 fw-bold"
                                value={limit}
                                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                                style={{ width: '70px' }}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="small text-muted fw-bold text-uppercase">entries</span>
                        </div>

                        <nav aria-label="Page navigation">
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 bg-light rounded-3 text-dark fw-bold" onClick={() => setPage(page - 1)}>Previous</button>
                                </li>
                                
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    // Show first, last, and pages around current
                                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                        return (
                                            <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                                <button 
                                                    className={`page-link border-0 rounded-3 fw-bold ${page === p ? 'btn-eco-primary text-white' : 'bg-light text-dark'}`} 
                                                    onClick={() => setPage(p)}
                                                >
                                                    {p}
                                                </button>
                                            </li>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <li key={p} className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>;
                                    }
                                    return null;
                                })}

                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 bg-light rounded-3 text-dark fw-bold" onClick={() => setPage(page + 1)}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default UserManagement;
