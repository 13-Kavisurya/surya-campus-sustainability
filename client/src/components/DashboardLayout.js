import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="d-flex min-vh-100 bg-eco-pattern" style={{ backgroundColor: 'var(--eco-bg)' }}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-2 d-md-none" 
                    onClick={toggleSidebar}
                />
            )}

            <main className="flex-grow-1 p-3 p-md-4 p-lg-5 position-relative z-1 transition-all animate-page" 
                  style={{ marginLeft: 'var(--sidebar-width, 260px)', transition: 'margin-left 0.3s ease' }}>
                
                {/* Mobile Header Bar */}
                <div className="d-md-none mb-3 d-flex align-items-center justify-content-between p-3 glass-card mx-0 border-0 shadow-sm" style={{ backgroundColor: 'var(--eco-surface)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-success text-white rounded p-1 shadow-sm">
                            <i className="bi bi-tree-fill"></i>
                        </div>
                        <span className="fw-bold display-font" style={{ fontSize: '1rem' }}>ECONEXUS</span>
                    </div>
                    <button className="btn btn-light shadow-sm" onClick={toggleSidebar}>
                        <i className={`bi ${isSidebarOpen ? 'bi-x' : 'bi-list'} fs-4`}></i>
                    </button>
                </div>

                <style>{`
                    @media (max-width: 768px) {
                        main { margin-left: 0 !important; }
                    }
                `}</style>
                {/* Decorative eco background elements (subtle) */}
                <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
                    <div className="position-absolute rounded-circle" style={{
                        width: '600px', height: '600px', top: '-20%', left: '-10%',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }} />
                    <div className="position-absolute rounded-circle" style={{
                        width: '500px', height: '500px', bottom: '-10%', right: '-5%',
                        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }} />
                </div>

                <div className="container-fluid px-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
