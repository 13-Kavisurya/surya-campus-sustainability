import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiDatabase, FiSettings, FiActivity, FiUserPlus, FiGrid, FiBell, FiClipboard, FiUser, FiCheckSquare, FiBarChart2, FiPlus, FiLogIn, FiTrendingUp, FiMapPin, FiSmartphone } from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout: userLogout } = useAuth();
    const { admin, logout: adminLogout } = useContext(AdminAuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (admin && !user) adminLogout();
        if (user) userLogout();
        navigate('/login');
    };

    const studentLinks = [
        { name: 'Student Dashboard', icon: FiGrid, path: '/student/dashboard' },
        { name: 'Report Sustainability', icon: FiBell, path: '/student/report' },
        { name: 'My Submissions', icon: FiClipboard, path: '/student/my-reports' },
        { name: 'Profile Settings', icon: FiUser, path: '/student/profile' }
    ];

    const staffLinks = [
        { name: 'Staff Dashboard', icon: FiGrid, path: '/staff/dashboard' },
        { name: 'Log Resource Usage', icon: FiPlus, path: '/staff/add-usage' },
        { name: 'Monthly Usage History', icon: FiActivity, path: '/staff/monthly-usage' },
        { name: 'Manage Reports', icon: FiCheckSquare, path: '/staff/manage-reports' },
        { name: 'Platform Analytics', icon: FiBarChart2, path: '/staff/analytics' }
    ];

    const adminLinks = [
        { name: 'Admin Dashboard', icon: FiActivity, path: '/admin/dashboard' },
        { name: 'User Management', icon: FiUsers, path: '/admin/manage-users' },
        { name: 'Global Audit', icon: FiFileText, path: '/admin/all-reports' },
        { name: 'Staff Usage Logs', icon: FiTrendingUp, path: '/admin/usage-tracker' },
        { name: 'Manual Entry', icon: FiDatabase, path: '/admin/database' },
        { name: 'System Setup', icon: FiSettings, path: '/admin/system-settings' },
        { name: 'Block Assignments', icon: FiMapPin, path: '/admin/block-assignments' },
        { name: 'Scale Admin', icon: FiUserPlus, path: '/admin/add-admin' },
        { name: 'User Login Portal', icon: FiLogIn, path: '/admin/user-login' },
        { name: 'Login QR Code', icon: FiSmartphone, path: '/admin/login-qr' },
    ];

    const renderLinkSection = (title, links) => (
        <div className="mb-3">
            <small className="text-secondary fw-bold text-uppercase px-3 mb-2 d-block" style={{ fontSize: '0.6rem', letterSpacing: '1.5px', opacity: 0.6 }}>
                {title}
            </small>
            <div className="d-flex flex-column gap-1">
                {links.map((link, idx) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => window.innerWidth < 768 && toggleSidebar()}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} py-2`}
                        style={{ fontSize: '16px' }}
                    >
                        <link.icon className="sidebar-icon me-2" style={{ fontSize: '18px' }} />
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );

    return (
        <div className={`sidebar-eco position-fixed start-0 top-0 bottom-0 d-flex flex-column p-3 z-3 shadow-sm ${isOpen ? 'open' : ''}`} 
             style={{ width: 'var(--sidebar-width, 240px)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-2 mb-4 mt-2 px-2"
            >
                <div className="bg-success text-white rounded shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-tree-fill fs-6"></i>
                </div>
                <div>
                    <h6 className="mb-0 fw-bold display-font text-dark tracking-tight" style={{ fontSize: '0.95rem' }}>EcoNexus</h6>
                    <div className="d-flex align-items-center gap-1">
                        <div className="bg-success rounded-circle" style={{ width: '4px', height: '4px' }}></div>
                        <small className="text-success fw-bold text-uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>
                            {!user && admin ? 'Master Node' : 'Sustainability OS'}
                        </small>
                    </div>
                </div>
            </motion.div>

            <div className="flex-grow-1 overflow-auto pe-1 custom-scrollbar">
                {(!user && admin) ? (
                    <>
                        {renderLinkSection('System Admin', adminLinks)}
                        {renderLinkSection('Student View', studentLinks)}
                        {renderLinkSection('Staff View', staffLinks)}
                    </>
                ) : (
                    <>
                        {user?.user_type === 'student' && renderLinkSection('Navigation', studentLinks)}
                        {user?.user_type === 'staff' && renderLinkSection('Internal Tools', staffLinks)}
                    </>
                )}
            </div>

            <div className="mt-auto pt-3 border-top border-light">
                <div className="d-flex align-items-center gap-2 p-2 bg-light/50 rounded-3 mb-2 border-0">
                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center border shadow-sm" style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                        <FiUser className="text-secondary" size={14} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: '0.8rem' }}>{user?.name || admin?.username || 'Guest'}</p>
                        <p className="mb-0 text-success fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>{user ? user.user_type : (admin ? 'Admin' : 'Visitor')}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-link w-100 d-flex align-items-center justify-content-center gap-2 text-danger fw-bold text-decoration-none hover-lift py-2"
                    style={{ fontSize: '0.8rem' }}
                >
                    <i className="bi bi-box-arrow-right"></i> Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
