import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const AssignStorage = () => {
  const { id } = useParams(); // Get the prototype ID from URL
  const [storageLocation, setStorageLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrototypeDetails();
  }, []);

  const fetchPrototypeDetails = async () => {
    try {
      const response = await api.get(`prototypes/${id}/`);
      setStorageLocation(response.data.storage_location || ""); // Pre-fill if location exists
    } catch (error) {
      console.error("Error fetching prototype details:", error);
    }
  };

  const handleAssign = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You need to log in first!");
      return;
    }
  
    if (!storageLocation.trim()) {
      alert("Please enter a storage location.");
      return;
    }
  
    try {
      const response = await api.post(
        `prototypes/${id}/assign_storage/`,
        { storage_location: storageLocation.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert("Storage assigned successfully!");
      navigate("/dashboard");
  
    } catch (error) {
      console.error("Error assigning storage:", error);
      console.log("Server Response:", error.response?.data); // Log backend error
      alert(`Failed to assign storage. ${error.response?.data?.error || "Please try again."}`);
    }
  };
  
  return (
    <div>
      <h2>Assign Storage</h2>
      <input
        type="text"
        placeholder="Enter storage location..."
        value={storageLocation}
        onChange={(e) => setStorageLocation(e.target.value)}
        required
      />
      <button onClick={handleAssign}>Assign Storage</button>
      <button onClick={() => navigate("/dashboard")}>Cancel</button>
    </div>
  );
};

export default AssignStorage;
