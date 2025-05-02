import React, { useState, useEffect } from "react";
import DashboardSidebar from "../components/Sidebar";
import DashboardHeader from "../components/ProfileNavbar";
import api from "../api/api";
import zxcvbn from "zxcvbn";
import "./Materials/css/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    username: "",
    email: "",
    phone: "",
    institution_id: "",
    institution_name: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setFormData({
        username: response.data.username || "",
        full_name: response.data.full_name || "",
        role: response.data.role || "",
        department: response.data.department || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        institution_id: response.data.institution_id || "",
        institution_name: response.data.institution_name || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  
    if (name === "new_password") {
      const strength = zxcvbn(value);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch("user/profile/", formData);
      setUser(response.data);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.detail || "Failed to update profile");
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    try {
      await api.post("user/change-password/", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess("Password changed successfully!");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
      setShowChangePassword(false);
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.response?.data?.detail || "Failed to change password.");
    }
  };

  if (loading) return (
    <div className="classic-loading">
      <i className="fas fa-spinner fa-spin"></i> Loading profile...
    </div>
  );

  if (!user) return <div className="classic-no-data">No user data found</div>;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="main-content">
        <DashboardHeader user={user} />

        <div className="classic-profile-container">
          <h2 className="classic-profile-title">
            <i className="fas fa-user-circle mr-2"></i>
            User Profile
          </h2>

          {error && (
            <div className="classic-alert classic-alert-danger">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="classic-alert classic-alert-success">
              <i className="fas fa-check-circle mr-2"></i>
              {success}
            </div>
          )}

          {!editMode ? (
            <div className="classic-profile">
              <div className="classic-profile-info">
                <div className="classic-info-item">
                  <span className="classic-info-label">
                    <i className="fas fa-user mr-2"></i>
                    Full Name:
                  </span>
                  <span className="classic-info-value">{user.full_name || "Not set"}</span>
                </div>
                
                <div className="classic-info-item">
                  <span className="classic-info-label">
                    <i className="fas fa-at mr-2"></i>
                    Username:
                  </span>
                  <span className="classic-info-value">{user.username || "Not set"}</span>
                </div>
                
                <div className="classic-info-item">
                  <span className="classic-info-label">
                    <i className="fas fa-envelope mr-2"></i>
                    Email:
                  </span>
                  <span className="classic-info-value">{user.email || "Not set"}</span>
                </div>
                
                <div className="classic-info-item">
                  <span className="classic-info-label">
                    <i className="fas fa-user-tag mr-2"></i>
                    Role:
                  </span>
                  <span className="classic-info-value">
                    {{
                      student: 'Student',
                      admin: 'System Administrator',
                      staff: 'Staff/Faculty',
                      general_user: 'General User',
                    }[user.role] || 'Not set'}
                  </span>
                </div>
                
                <div className="classic-info-item">
                  <span className="classic-info-label">
                    <i className="fas fa-phone mr-2"></i>
                    Phone:
                  </span>
                  <span className="classic-info-value">{user.phone || "Not set"}</span>
                </div>
                
                <div className="classic-info-item">
                  <span className="classic-info-label">
                    <i className="fas fa-university mr-2"></i>
                    Institution ID:
                  </span>
                  <span className="classic-info-value">{user.institution_id || "Not set"}</span>
                </div>
              </div>

              <div className="classic-profile-actions">
                <button 
                  onClick={() => setEditMode(true)} 
                  className="classic-btn classic-btn-primary"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </button>
                <button 
                  onClick={() => setShowChangePassword(!showChangePassword)} 
                  className="classic-btn classic-btn-secondary"
                >
                  <i className="fas fa-key mr-2"></i>
                  {showChangePassword ? "Cancel" : "Change Password"}
                </button>
              </div>
            </div>
          ) : (
            <div className="classic-profile-card">
              <form onSubmit={handleSubmit} className="classic-profile-form">
                <div className="classic-form-group">
                  <label htmlFor="username" className="classic-form-label">
                    <i className="fas fa-at mr-2"></i>
                    Username:
                  </label>
                  <input
                    type="text"
                    className="classic-form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>

                <div className="classic-form">
                  <label htmlFor="email" className="classic-form-label">
                    <i className="fas fa-envelope mr-2"></i>
                    Email:
                  </label>
                  <input
                    type="email"
                    className="classic-form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="classic-form">
                  <label htmlFor="phone" className="classic-form-label">
                    <i className="fas fa-phone mr-2"></i>
                    Phone:
                  </label>
                  <input
                    type="text"
                    className="classic-form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="classic-form-actions">
                  <button type="submit" className="classic-btn classic-btn-success" style={{backgroundColor:'#64A293',color:'white'}}>
                    <i style={{color:'white'}} className="fas fa-save mr-2"></i>
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditMode(false)} 
                    className="classic-btn classic-btn-danger"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showChangePassword && (
            <div className="classic-password-card">
              <div className="classic-card-header">
                <h3>
                  <i className="fas fa-key mr-2"></i>
                  Change Password
                </h3>
              </div>
              
              <div className="classic-card-body">
                <form onSubmit={handleChangePasswordSubmit} className="classic-password-form">
                  <div className="classic-form-group">
                    <label htmlFor="currentPassword" className="classic-form-label">
                      <i className="fas fa-lock mr-2"></i>
                      Current Password:
                    </label>
                    <input
                      type="password"
                      className="classic-form-control"
                      id="currentPassword"
                      name="current_password"
                      placeholder="Enter current password"
                      value={passwordData.current_password}
                      onChange={handlePasswordInputChange}
                      required
                    />
                  </div>

                  <div className="classic-form-group">
                    <label htmlFor="newPassword" className="classic-form-label">
                      <i className="fas fa-key mr-2"></i>
                      New Password:
                    </label>
                    <input
                      type="password"
                      className="classic-form-control"
                      id="newPassword"
                      name="new_password"
                      placeholder="Enter new password"
                      value={passwordData.new_password}
                      onChange={handlePasswordInputChange}
                      required
                    />
                    {passwordStrength && (
                      <div className="classic-password-strength">
                        <div className={`strength-meter strength-${passwordStrength.score}`}>
                          <div className="strength-bar"></div>
                          <div className="strength-label">
                            Strength: {["Very Weak", "Weak", "Fair", "Good", "Strong"][passwordStrength.score]}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="classic-form-group">
                    <label htmlFor="confirmPassword" className="classic-form-label">
                      <i className="fas fa-redo mr-2"></i>
                      Confirm Password:
                    </label>
                    <input
                      type="password"
                      className="classic-form-control"
                      id="confirmPassword"
                      name="confirm_password"
                      placeholder="Confirm new password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordInputChange}
                      required
                    />
                  </div>

                  <div className="classic-form-actions">
                    <button type="submit" className="classic-btn classic-btn-primary">
                      <i className="fas fa-save mr-2"></i>
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;