// components/ClassicPreloader.js
import React from "react";
import "./Materials/css/Preloading.css"; 

const Preloader = () => {
  return (
    <div className="preloader-overlay">
      <div className="classic-preloader">
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default Preloader;