import { useEffect, useState } from "react";
import api from "api/api";
import DashboardSidebar from '../../components/Sidebar';
import DashboardHeader from "../../components/ProfileNavbar";
import '../Materials/css/AdminDashboard.css';
import './css/DashboardModalCss.css';
import ClassicPreloader from './../Preloader'
import BulkImportModal from './BulkImportModal';


const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [generalUsers, setGeneralUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");
    const [activeModal, setActiveModal] = useState(null);
    const [activeTab, setActiveTab] = useState("users");
    const [error, setError] = useState(null);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);

    
    const [modalData, setModalData] = useState({
        user: { username: "", email: "", role: "", department: "", full_name: "", password: "", password_confirmation: "" },
        department: { name: "", code: "" },
        approval: { userId: null, username: "" }
    });
    
    const [loading, setLoading] = useState({
        users: false,
        generalUsers: false,
        departments: false,
        actions: false
    });
    
    const [errors, setErrors] = useState({
        users: null,
        generalUsers: null,
        departments: null
    });

    const [formData, setFormData] = useState({
        full_name: "",
        role: "",
        username: "",
        email: "",
        phone: "",
        institution_id: "",
        institution_name: "",
    });

    useEffect(() => {
        fetchInitialData();
        fetchUserProfile();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(prev => ({ ...prev, users: true, generalUsers: true, departments: true }));
            setErrors({ users: null, generalUsers: null, departments: null });
            
            const [usersRes, generalUsersRes, departmentsRes] = await Promise.all([
                api.get("/admin/users/"),
                api.get("/admin/users/general_users/"),
                api.get("/departments/")
            ]);
            
            setUsers(usersRes.data);
            setGeneralUsers(generalUsersRes.data);
            setDepartments(departmentsRes.data);
        } catch (error) {
            console.error("Error fetching initial data:", error);
            setErrors({
                users: "Failed to load users",
                generalUsers: "Failed to load general users",
                departments: "Failed to load departments"
            });
        } finally {
            setLoading(prev => ({ ...prev, users: false, generalUsers: false, departments: false }));
        }
    };

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
        } catch (error) {
            console.error("Error fetching profile:", error);
            setError("Failed to load profile");
        }
    };

    const createUser = async () => {
        try {
            setLoading(prev => ({ ...prev, actions: true }));
            
            // Validate password
            if (modalData.user.password !== modalData.user.password_confirmation) {
                throw new Error("Passwords don't match");
            }
    
            if (modalData.user.password.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }
    
            // Create user data object
            const userData = {
                username: modalData.user.username,
                email: modalData.user.email,
                full_name: modalData.user.full_name,
                password: modalData.user.password,
                role: modalData.user.role,
                department: modalData.user.department,
                password_confirmation: modalData.user.password_confirmation 
            };
    
            await api.post("/admin/users/", userData);
            await fetchUsers();
            closeModal();
        } catch (error) {
            console.error("Error creating user:", error);
            setErrors(prev => ({ 
                ...prev, 
                users: error.response?.data?.message || error.message || "Failed to create user" 
            }));
        } finally {
            setLoading(prev => ({ ...prev, actions: false }));
        }
    };

    const createDepartment = async () => {
        try {
            setLoading(prev => ({ ...prev, actions: true }));
            await api.post("/departments/", modalData.department);
            await fetchDepartments();
            closeModal();
        } catch (error) {
            console.error("Error creating department:", error);
            setErrors(prev => ({ ...prev, departments: error.response?.data?.message || "Failed to create department" }));
        } finally {
            setLoading(prev => ({ ...prev, actions: false }));
        }
    };

    const approveUser = async () => {
        try {
            setLoading(prev => ({ ...prev, actions: true }));
            await api.post(`/admin/users/${modalData.approval.userId}/approve_user/`);
            await fetchGeneralUsers();
            closeModal();
        } catch (error) {
            console.error("Error approving user:", error);
            setErrors(prev => ({ ...prev, generalUsers: error.response?.data?.message || "Failed to approve user" }));
        } finally {
            setLoading(prev => ({ ...prev, actions: false }));
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(prev => ({ ...prev, users: true }));
            const response = await api.get("/admin/users/");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setErrors(prev => ({ ...prev, users: "Failed to load users" }));
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    };

    const fetchGeneralUsers = async () => {
        try {
            setLoading(prev => ({ ...prev, generalUsers: true }));
            const response = await api.get("/admin/users/general_users/");
            setGeneralUsers(response.data);
        } catch (error) {
            console.error("Error fetching general users:", error);
            setErrors(prev => ({ ...prev, generalUsers: "Failed to load general users" }));
        } finally {
            setLoading(prev => ({ ...prev, generalUsers: false }));
        }
    };

    const fetchDepartments = async () => {
        try {
            setLoading(prev => ({ ...prev, departments: true }));
            const response = await api.get("/departments/");
            setDepartments(response.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setErrors(prev => ({ ...prev, departments: "Failed to load departments" }));
        } finally {
            setLoading(prev => ({ ...prev, departments: false }));
        }
    };

    const openModal = (modalType, data = {}) => {
        setActiveModal(modalType);
        setModalData(prev => ({
            ...prev,
            [modalType]: { ...prev[modalType], ...data }
        }));
        setErrors(prev => ({ ...prev, [modalType]: null }));
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const handleInputChange = (modalType, field, value) => {
        setModalData(prev => ({
            ...prev,
            [modalType]: {
                ...prev[modalType],
                [field]: value
            }
        }));
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredGeneralUsers = generalUsers.filter(gu =>
        gu.username.toLowerCase().includes(search.toLowerCase()) ||
        gu.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <DashboardSidebar />
            <div className="main-content">
                <DashboardHeader user={user} />
                <div className="admin-dashboard-container">
                <h2 class="classic-profile-title"><i class="fas fa-tools mr-2"></i>Admin Panel</h2>
                    <div className="custom-tabs">
                        <button
                            className={activeTab === "users" ? "active" : ""}
                            onClick={() => setActiveTab("users")}
                        >
                            <i className="fas fa-users mr-2"></i>
                              Users
                        </button>
                        <button
                            className={activeTab === "general" ? "active" : ""}
                            onClick={() => setActiveTab("general")}
                        >
                            <i className="fas fa-user-clock mr-2"></i>
                              General Users
                        </button>
                        <button
                            className={activeTab === "departments" ? "active" : ""}
                            onClick={() => setActiveTab("departments")}
                        >
                            <i className="fas fa-building mr-2"></i>
                              Departments
                        </button>
                    </div>

                    {activeTab === "users" && (
                        <>
                            <div className="controls-row">
                                <div className="search-control">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <button 
                                    className="action-control primary" 
                                    onClick={() => setShowBulkImportModal(true)}
                                    >
                                    <i className="fas fa-file-import mr-2" style={{ color: 'white' }}></i>
                                    Import Bulk Users
                                    </button>

                                    <button 
                                    className="action-control primary" 
                                    onClick={() => openModal("user")}
                                    >
                                    <i className="fas fa-plus mr-2" style={{ color: 'white' }}></i>
                                    Add User
                                    </button>

                            </div>
                        

                            {loading.users ? (
                                <div className="loading-state">
                                    <ClassicPreloader/>
                                </div>
                            ) : errors.users ? (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    {errors.users}
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead >
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.full_name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`role-badge ${user.role}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeTab === "general" && (
                        <>
                            <div className="controls-row">
                                <div className="search-control">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search general users..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loading.generalUsers ? (
                                <div className="loading-state">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Loading general users...</span>
                                </div>
                            ) : errors.generalUsers ? (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    {errors.generalUsers}
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGeneralUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`status-badge ${user.is_approved ? 'approved' : 'pending'}`}>
                                                        {user.is_approved ? "Approved" : "Pending"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {!user.is_approved && (
                                                        <button
                                                        className="classic-modal-btn classic-modal-btn-primary" 
                                                        onClick={() => openModal('approval', { 
                                                                userId: user.id,
                                                                username: user.username 
                                                            })}
                                                        >
                                                    <i className="fas fa-check mr-2" style={{ color: 'white' }}></i>
                                                    Approve
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeTab === "departments" && (
                        <>
                            <div className="controls-row">
                                <div className="search-control">
                                    <i className="fas fa-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search departments..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="action-control primary" 
                                    onClick={() => openModal("department")}
                                >
                                    <i className="fas fa-plus mr-2" style={{ color: 'white' }}></i>
                                    Add Department
                                </button>
                            </div>

                            {loading.departments ? (
                                <div className="loading-state">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Loading departments...</span>
                                </div>
                            ) : errors.departments ? (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    {errors.departments}
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Code</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDepartments.map(dept => (
                                            <tr key={dept.id}>
                                                <td>{dept.name}</td>
                                                <td>{dept.code || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {activeModal === 'user' && (
    <div className="classic-modal-overlay active">
        <div className="classic-modal-container">
            <div className="classic-modal-header">
                <h3>
                    <i className="fas fa-user-plus mr-2"></i>
                    Add New User
                </h3>
                <button className="classic-modal-close" onClick={closeModal}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="classic-modal-body">
                {errors.users && (
                    <div className="classic-modal-error">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {errors.users}
                    </div>
                )}
                <div className="classic-form-group">
                    <label>
                        <i className="fas fa-user mr-2"></i>
                        Full Name
                    </label>
                    <input
                        type="text"
                        className="classic-form-control"
                        value={modalData.user.full_name}
                        onChange={(e) => handleInputChange('user', 'full_name', e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="classic-form-group">
                    <label>
                        <i className="fas fa-user mr-2"></i>
                        Username
                    </label>
                    <input
                        type="text"
                        className="classic-form-control"
                        value={modalData.user.username}
                        onChange={(e) => handleInputChange('user', 'username', e.target.value)}
                    />
                </div>
                <div className="classic-form-group">
                    <label>
                        <i className="fas fa-envelope mr-2"></i>
                        Email
                    </label>
                    <input
                        type="email"
                        className="classic-form-control"
                        value={modalData.user.email}
                        onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                    />
                </div>
                <div className="classic-form-group">
                <label>
                    <i className="fas fa-lock mr-2"></i>
                    Password
                </label>
                <input
                    type="password"
                    className="classic-form-control"
                    value={modalData.user.password}
                    onChange={(e) => handleInputChange('user', 'password', e.target.value)}
                    placeholder="Set a strong password"
                    required
                    minLength="8"
                />
                <small className="form-text text-muted">
                    Password must be at least 8 characters long
                </small>
            </div>

            <div className="classic-form-group">
                <label>
                    <i className="fas fa-lock mr-2"></i>
                    Confirm Password
                </label>
                <input
                    type="password"
                    className="classic-form-control"
                    value={modalData.user.password_confirmation || ''}
                    onChange={(e) => handleInputChange('user', 'password_confirmation', e.target.value)}
                    placeholder="Confirm password"
                    required
                />
            </div>
                <div className="classic-form-group">
                    <label>
                        <i className="fas fa-user-tag mr-2"></i>
                        Role
                    </label>
                    <select
                        className="classic-form-control"
                        value={modalData.user.role}
                        onChange={(e) => handleInputChange('user', 'role', e.target.value)}
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="student">Student</option>
                    </select>
                </div>
                <div className="classic-form-group">
                    <label>
                        <i className="fas fa-building mr-2"></i>
                        Department
                    </label>
                    <select
                        className="classic-form-control"
                        value={modalData.user.department.name}
                        onChange={(e) => handleInputChange('user', 'department', e.target.value)}
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="classic-modal-footer">
                <button 
                    className="classic-modal-btn classic-modal-btn-cancel" 
                    onClick={closeModal}
                    disabled={loading.actions}
                >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                </button>
                <button 
                    className="classic-modal-btn classic-modal-btn-primary" 
                    onClick={createUser}
                    disabled={
                        loading.actions || 
                        !modalData.user.username || 
                        !modalData.user.email || 
                        !modalData.user.role || 
                        !modalData.user.password ||
                        !modalData.user.password_confirmation ||
                        modalData.user.password !== modalData.user.password_confirmation ||
                        modalData.user.password.length < 8 ||
                        !modalData.user.full_name
                    }            >
                    {loading.actions ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Saving...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-save mr-2" style={{ color: 'white' }}></i>
                            Save User
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
)}

            {/* Add Department Modal */}
            {activeModal === 'department' && (
                <div className="classic-modal-overlay active">
                    <div className="classic-modal-container">
                        <div className="classic-modal-header">
                            <h3>
                                <i className="fas fa-building mr-2"></i>
                                Add New Department
                            </h3>
                            <button className="classic-modal-close" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="classic-modal-body">
                            {errors.departments && (
                                <div className="classic-modal-error">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    {errors.departments}
                                </div>
                            )}
                            <div className="classic-form-group">
                                <label>
                                    <i className="fas fa-signature mr-2"></i>
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    className="classic-form-control"
                                    value={modalData.department.name}
                                    onChange={(e) => handleInputChange('department', 'name', e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="classic-form-group">
                                <label>
                                    <i className="fas fa-code mr-2"></i>
                                    Department Code
                                </label>
                                <input
                                    type="text"
                                    className="classic-form-control"
                                    value={modalData.department.code}
                                    onChange={(e) => handleInputChange('department', 'code', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="classic-modal-footer">
                            <button 
                                className="classic-modal-btn classic-modal-btn-cancel" 
                                onClick={closeModal}
                                disabled={loading.actions}
                            >
                                <i className="fas fa-times mr-2"></i>
                                Cancel
                            </button>
                            <button 
                                className="classic-modal-btn classic-modal-btn-primary" 
                                onClick={createDepartment}
                                disabled={loading.actions || !modalData.department.name}
                            >
                                {loading.actions ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save mr-2"style={{ color: 'white' }}></i>
                                        Save Department
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

                {/* Add Bulk Import Modal */}
                <BulkImportModal 
                show={showBulkImportModal}
                onHide={() => setShowBulkImportModal(false)}
                onSuccess={() => {
                    fetchUsers(); // Refresh users list after successful import
                    setShowBulkImportModal(false);
                }}
            />
            

            {/* Approve User Modal */}
            {activeModal === 'approval' && (
                <div className="classic-modal-overlay active">
                    <div className="classic-modal-container classic-modal-sm">
                        <div className="classic-modal-header">
                            <h3>
                                <i className="fas fa-user-check mr-2"></i>
                                Confirm Approval
                            </h3>
                            <button className="classic-modal-close" onClick={closeModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="classic-modal-body">
                            <div className="classic-modal-confirm-text">
                                <p>Are you sure you want to approve this user?</p>
                                <div className="classic-modal-highlight">
                                    <i className="fas fa-user mr-2"></i>
                                    {modalData.approval.full_name || modalData.approval.username || modalData.approval.email}
                                </div>
                                <p className="mt-3">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="classic-modal-footer">
                            <button 
                                className="classic-modal-btn classic-modal-btn-cancel" 
                                onClick={closeModal}
                                disabled={loading.actions}
                            >
                                <i className="fas fa-times mr-2"></i>
                                Cancel
                            </button>
                            <button 
                                className="classic-modal-btn classic-modal-btn-primary" 
                                onClick={approveUser}
                                disabled={loading.actions}
                            >
                                {loading.actions ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save mr-2"style={{ color: 'white' }}></i>
                                        Approve User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;