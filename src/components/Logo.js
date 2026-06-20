import React from 'react';
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo-container">
      <img
        src={`${process.env.PUBLIC_URL}/assets/EN-Monogram-with-date.svg`}
        alt="E & N Monogram"
        className="logo-svg"
      />
    </div>
  );
};

export default Logo;
