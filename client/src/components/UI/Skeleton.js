import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '0.5rem', className = '' }) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
        position: 'relative'
      }}
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="row g-3">
    {[1, 2, 3, 4].map(i => (
      <div className="col-md-3" key={i}>
        <div className="glass-card p-4 border-0">
          <Skeleton width="40px" height="40px" className="mb-3" />
          <Skeleton width="60%" className="mb-2" />
          <Skeleton width="40%" height="24px" />
        </div>
      </div>
    ))}
    <div className="col-lg-8 mt-4">
      <div className="glass-card p-4 border-0">
        <Skeleton width="200px" height="24px" className="mb-4" />
        <Skeleton height="200px" />
      </div>
    </div>
    <div className="col-lg-4 mt-4">
      <div className="glass-card p-4 border-0 h-100">
        <Skeleton width="150px" height="24px" className="mb-4" />
        <div className="space-y-4">
           {[1, 2, 3].map(i => <Skeleton key={i} height="48px" className="mb-3" />)}
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
