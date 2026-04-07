import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', color = 'var(--eco-primary)' }) => {
  const dimensions = {
    sm: { width: 24, height: 24, border: 2 },
    md: { width: 40, height: 40, border: 3 },
    lg: { width: 64, height: 64, border: 4 }
  }[size];

  return (
    <div className="d-flex align-items-center justify-content-center p-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          border: `${dimensions.border}px solid rgba(0,0,0,0.05)`,
          borderTop: `${dimensions.border}px solid ${color}`,
          borderRadius: '50%'
        }}
      />
    </div>
  );
};

export default Loader;
