import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardHeader from '../components/Navbar';
import DashboardSidebar from '../components/Sidebar';
import { Modal, Button } from 'react-bootstrap';
import ClassicPreloader from "./Preloader";
import '../pages/Materials/css/ViewPrototypeModal.css';

const ViewAllPrototype = ({ show, onHide, prototypeId }) => {
  // State management
  const [prototype, setPrototype] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPrototypes, setAllPrototypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedPrototype, setSelectedPrototype] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, studentsRes, prototypesRes] = await Promise.all([
          api.get("user/profile/"),
          api.get("users/students/"),
          api.get("/prototypes/")
        ]);
        
        setUser(userRes.data);
        setStudents(studentsRes.data || []);
        setAllPrototypes(prototypesRes.data.results || prototypesRes.data || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchInitialData();
  }, []);

  // Search functionality with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        fetchPrototypes(searchTerm);
      } else {
        fetchPrototypes();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch prototype details when modal opens
  useEffect(() => {
    if (prototypeId && show) {
      fetchPrototypeDetails(prototypeId);
    }
  }, [prototypeId, show]);

  const fetchPrototypes = async (search = "") => {
    try {
      const response = await api.get(`/prototypes/?search=${search}`);
      setAllPrototypes(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching prototypes:", error);
    }
  };

  const fetchPrototypeDetails = async (id) => {
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
    }
  };

  // Helper functions
  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.username : "N/A";
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : "N/A";
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

  if (initialLoad) {
    return (
      <div className="classic-loading">
      <ClassicPreloader />
      </div>
    );
  }

  if (!user) return <div className="classic-no-data">No user data found</div>;

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
         
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {allPrototypes.length > 0 ? (
              allPrototypes.map((prototype) => (
                <div className="col" key={prototype.id}>
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
            {selectedPrototype ? (
              <div className="prototype-details">
                {/* Basic Information Section */}
                <div className="detail-section">
                  <h4 className="section-title">
                    <i className="fas fa-info-circle mr-2"></i>
                    Basic Information
                  </h4>
                  <div className="detail-grid">
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
                      <span>{selectedPrototype.student?.level_display || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Academic Year:</label>
                      <span>{selectedPrototype.academic_year || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Supervisors:</label>
                      <ul className="supervisors-list">
                        {selectedPrototype.supervisors?.length > 0 ? (
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
                    Project Details
                  </h4>
                  <div className="detail-item full-width">
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
                    Status & Logistics
                  </h4>
                  <div className="detail-grid">
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
                      Feedback
                    </h4>
                    <div className="feedback-text">
                      {selectedPrototype.feedback}
                    </div>
                  </div>
                )}

                {/* Attachments & Links Section */}
                <div className="detail-section">
                  <h4 className="section-title">
                    <i className="fas fa-paperclip mr-2"></i>
                    Attachments & Links
                  </h4>
                  <div className="attachments">
                    {selectedPrototype.attachment?.report && (
                      renderAttachmentLink(selectedPrototype.attachment.report, "Download Report")
                    )}
                    {selectedPrototype.attachment?.source_code && (
                      renderAttachmentLink(selectedPrototype.attachment.source_code, "Download Source Code")
                    )}
                    {renderAttachmentLink(selectedPrototype.project_link, "Project URL")}
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