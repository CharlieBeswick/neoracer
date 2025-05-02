import React from 'react';
import './HeadlightGlow.css';

const HeadlightGlow: React.FC = () => {
  return (
    // Keep the container for the beam
    <div className="headlight-glow">
      {/* Add a separate element for the bright source */}
      <div className="headlight-source"></div>
    </div>
  );
};

export default HeadlightGlow; 