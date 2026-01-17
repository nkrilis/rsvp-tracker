import React from 'react';
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo-container">
      <svg 
        width="180" 
        height="100" 
        viewBox="0 0 180 100" 
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        <text
          x="90"
          y="70"
          textAnchor="middle"
          className="logo-text"
          fontSize="72"
          fontFamily="Great Vibes, cursive"
          fill="#000"
        >
          N & E
        </text>
      </svg>
      <div className="logo-subtitle">Nicholas & Elisabeth</div>
    </div>
  );
};

export default Logo;
