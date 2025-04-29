import React, { useState, useEffect } from "react";
import api from "../api/api";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    in_app: true
  });
  const [departments, setDepartments] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchNotificationPreferences();
    fetchDepartments();
    fetchStorageLocations();
    fetchSupervisors();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setIsAdmin(response.data.role === "admin");
      if (response.data.role === "admin") {
        fetchSystemSettings();
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await api.get("settings/notifications/");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("departments/");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchStorageLocations = async () => {
    try {
      const response = await api.get("prototypes/storage_locations/");
      setStorageLocations(response.data);
    } catch (error) {
      console.error("Error fetching storage locations:", error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await api.get("users/supervisors/");
      setSupervisors(response.data);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await api.get("settings/");
      setSystemSettings(response.data);
    } catch (error) {
      console.error("Error fetching system settings:", error);
    }
  };



  if (loading) {
    return <p>Loading settings...</p>;
  }

  return (
    <div>
      <h2>Settings</h2>




      <div>
        <h3>Available Departments</h3>
        <ul>
          {departments.map(dept => (
            <li key={dept.id}>{dept.name} ({dept.code})</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Storage Locations</h3>
        <ul>
          {storageLocations.map((location, index) => (
            <li key={index}>{location}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Supervisors</h3>
        <ul>
          {supervisors.map(sup => (
            <li key={sup.id}>{sup.username || sup.email}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Settings;