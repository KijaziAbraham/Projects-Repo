import React, { useState, useEffect } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import './Preloading.css'

function Preloading() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); 

    return () => clearTimeout(timer); 
  }, []);

  return (
    <div className="Preloading">
      {loading && (
        <ScaleLoader
          color="green"
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      )}
    </div>
  );
}

export default Preloading;