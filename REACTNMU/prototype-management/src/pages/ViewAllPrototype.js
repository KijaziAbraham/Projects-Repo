import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardHeader from '../components/Navbar';
import DashboardSidebar from '../components/Sidebar';
import { Modal, Button } from 'react-bootstrap';
import '../pages/Materials/css/ViewPrototypeModal.css';

const ViewAllPrototype =  ({ show, onHide, prototypeId })  => {
  const [prototype, setPrototype] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPrototypes, setAllPrototypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedPrototype, setSelectedPrototype] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await api.get("users/students/");
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch all prototypes
  const fetchPrototypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/prototypes/?search=${searchTerm}`);
      setAllPrototypes(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching prototypes:", error);
      setError("Failed to load prototypes.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch prototype details when one is selected
  const fetchPrototypeDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const [prototypeRes, deptsRes, supsRes] = await Promise.all([
        api.get(`prototypes/${id}/`),
        api.get("departments/"),
        api.get("users/supervisors/")
      ]);
      
      setSelectedPrototype(prototypeRes.data);
      setDepartments(deptsRes.data || []);
      setSupervisors(supsRes.data || []);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching prototype details:", err);
      setError("Failed to load prototype details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchStudents();
    fetchPrototypes();
  }, []);

  useEffect(() => {
    if (searchTerm !== "") {
      const timer = setTimeout(() => fetchPrototypes(), 500);
      return () => clearTimeout(timer);
    } else {
      fetchPrototypes();
    }
  }, [searchTerm]);

    useEffect(() => {
      const fetchData = async () => {
        if (!prototypeId) return;
        
        setLoading(true);
        setError(null);
        setPrototype(null);
  
        try {
          // Fetch all data in parallel
          const [prototypeRes, studentsRes, deptsRes, supsRes] = await Promise.all([
            api.get(`prototypes/${prototypeId}/`),
            api.get("users/students/"),
            api.get("departments/"),
            api.get("users/supervisors/")
          ]);
  
          setPrototype(prototypeRes.data);
          setStudents(studentsRes.data || []);
          setDepartments(deptsRes.data || []);
          setSupervisors(supsRes.data || []);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load prototype details.");
        } finally {
          setLoading(false);
        }
      };
  
      if (show) {
        fetchData();
      }
    }, [prototypeId, show]);

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.username : "N/A";
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : "N/A";
  };

  const getSupervisorEmail = (supervisorId) => {
    const supervisor = supervisors.find(s => s.id === supervisorId);
    return supervisor ? supervisor.email : "N/A";
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "submitted_not_reviewed":
        return <span className="status-badge not-reviewed">Submitted (Not Reviewed)</span>;
      case "submitted_reviewed":
        return <span className="status-badge reviewed">Submitted (Reviewed)</span>;
      default:
        return <span className="status-badge">N/A</span>;
    }
  };

  const renderAttachmentLink = (url, label) => {
    if (!url) return null;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="attachment-link">
        <i className={`fas ${label.includes('Report') ? 'fa-file-pdf' : 'fa-code'}`}></i> {label}
      </a>
    );
  };

  return (
    <div className="dashboard-container">
      <DashboardSidebar />
      <div className="main-content">
        <DashboardHeader
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <div className="review-prototypes-container">
        <h2 className="classic-profile-title">
        <i className="fas fa-layer-group mr-2"></i>
        All Prototypes
      </h2>
          {loading && !selectedPrototype ? (
            <div className="loading-state">
              <div className="spinner-border text-primary" role="status"></div>
              <p>Loading prototypes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {allPrototypes.length > 0 ? (
                allPrototypes.map((prototype) => (
              <div className="col"
                    key={prototype.id}>
                    <div
                    className="card"
                    style={{
                      borderLeft: "4px solid #64A293",
                      cursor: "pointer",
                    }}
                    onClick={() => fetchPrototypeDetails(prototype.id)}
                  >
                    <div className="card-body">
                      <h5 className="card-title">Title: {prototype.title || "Untitled"}</h5>
                      <h6 className="card-text">
                          Status: {prototype.status === 'submitted_not_reviewed'
                            ? 'Submitted (Not Reviewed)'
                            : prototype.status === 'submitted_reviewed'
                            ? 'Submitted (Reviewed)'
                            : prototype.status || 'Not set'}
                        </h6>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Student: {prototype.student?.full_name || prototype.student?.username || getStudentName(prototype.student)}
                      </h6>
                      {/* <p className="card-text">
                        {prototype.abstract?.substring(0, 100)}
                        {prototype.abstract?.length > 50 && "..."}
                      </p> */}
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="no-results">
                  <i className="fas fa-info-circle"></i>
                  <p>No prototypes found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prototype Detail Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-file-alt mr-2"></i>
              Prototype Details
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
            {loading ? (
              <div className="loading-state">
                <div className="spinner-border text-primary" role="status"></div>
                <p>Loading details...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-circle text-danger"></i>
                <p>{error}</p>
              </div>
            ) : selectedPrototype ? (
          <div className="prototype-details">
            {/* Basic Information Section */}
            <div className="detail-section">
            <h4 className="section-title">
    <i className="fas fa-info-circle mr-2"></i>
    {/* Alternative: <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> */}
    Basic Information
  </h4>              <div className="detail-grid">
                <div className="detail-item">
                  <label>Title:</label>
                  <span>{selectedPrototype.title || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Student:</label>
                  <span>{selectedPrototype.student?.full_name || getStudentName(selectedPrototype.student)}</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{selectedPrototype.department?.name || getDepartmentName(selectedPrototype.department)}</span>
                </div>
                <div className="detail-item">
                  <label>Research Group:</label>
                  <span>{selectedPrototype.research_group || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Student Level:</label>
                  <span>{selectedPrototype.student?.level_display  || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Academic Year:</label>
                  <span>{selectedPrototype.academic_year || 'N/A'}</span>
                </div>
                <div className="detail-item">
                <label>Supervisors:</label>
                <ul className="supervisors-list">
                  {selectedPrototype.supervisors && selectedPrototype.supervisors.length > 0 ? (
                    selectedPrototype.supervisors.map((sup) => (
                      <li key={sup.id}>
                        {sup.full_name || sup.email}
                      </li>
                    ))
                  ) : (
                    <li>No supervisors assigned</li>
                  )}
                </ul>
              </div>

              </div>
            </div>

            {/* Project Details Section */}
            <div className="detail-section">
            <h4 className="section-title">
    <i className="fas fa-file-alt mr-2"></i>
    {/* Alternative: <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> */}
    Project Details
  </h4>              <div className="detail-item full-width">
                <label>Abstract:</label>
                <div className="abstract-text">
                  {selectedPrototype.abstract || 'No abstract provided'}
                </div>
              </div>
            </div>

            {/* Status & Logistics Section */}
            <div className="detail-section">
            <h4 className="section-title">
    <i className="fas fa-clipboard-check mr-2"></i>
    {/* Alternative: <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> */}
    Status & Logistics
  </h4>              <div className="detail-grid">
                <div className="detail-item">
                  <label>Status:</label>
                  <span>{getStatusDisplay(selectedPrototype.status)}</span>
                </div>
                <div className="detail-item">
                  <label>Physical Prototype:</label>
                  <span>{selectedPrototype.has_physical_prototype ? "Yes" : "No"}</span>
                </div>
                <div className="detail-item">
                  <label>Barcode:</label>
                  <span>{selectedPrototype.barcode || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Storage Location:</label>
                  <span>{selectedPrototype.storage_location || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Submission Date:</label>
                  <span>
                    {selectedPrototype.submission_date 
                      ? new Date(selectedPrototype.submission_date).toLocaleString() 
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            {selectedPrototype.feedback && (
              <div className="detail-section">
<h4 className="section-title">
    <i className="fas fa-comment-dots mr-2"></i>
    {/* Alternative: <FontAwesomeIcon icon={faCommentDots} className="mr-2" /> */}
    Feedback
  </h4>                <div className="feedback-text">
                  {selectedPrototype.feedback}
                </div>
              </div>
            )}

            {/* Attachments & Links Section */}
            <div className="detail-section">
            <h4 className="section-title">
    <i className="fas fa-paperclip mr-2"></i>
    {/* Alternative: <FontAwesomeIcon icon={faPaperclip} className="mr-2" /> */}
    Attachments & Links
  </h4>


              {/* Attachments (if exist) */}
              <div className="attachments">
                {selectedPrototype.attachment?.report && (
                  renderAttachmentLink(selectedPrototype.attachment.report, "Download Report", "fa-file-pdf")
                )}
                {selectedPrototype.attachment?.source_code && (
                  renderAttachmentLink(selectedPrototype.attachment.source_code, "Download Source Code", "fa-code")
                )}

                {renderAttachmentLink(selectedPrototype.project_link, "Project URL", "fa-external-link")}
         </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <i className="fas fa-info-circle"></i>
            <p>No prototype data available</p>
          </div>
        )}
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ViewAllPrototype;

