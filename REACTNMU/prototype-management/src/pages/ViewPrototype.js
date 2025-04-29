import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import api from "../api/api";
import '../pages/Materials/css/ViewPrototypeModal.css';


const ViewPrototypeModal = ({ show, onHide, prototypeId }) => {
  const [prototype, setPrototype] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);


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
    const student = students.find(s => s.id === studentId);
    return student ? student.username : 'N/A';
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

  const renderAttachmentLink = (url, label, icon) => {
    if (!url) return null;
    
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="attachment-link">
        <i className={`fas ${icon}`}></i> {label}
      </a>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="classic-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fas fa-file-alt mr-2"></i>
          Prototype Details
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p>Loading prototype details...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-circle text-danger"></i>
            <p className="error-message">{error}</p>
          </div>
        ) : prototype ? (
          <div className="prototype-details">
            {/* Basic Information Section */}
            <div className="detail-section">
            <h4 className="section-title">
              <i className="fas fa-info-circle mr-2"></i>
              {/* Alternative: <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> */}
              Basic Information
            </h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Title:</label>
                  <span>{prototype.title || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Student:</label>
                  <span>{prototype.student?.full_name || getStudentName(prototype.student)}</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{prototype.department?.name || getDepartmentName(prototype.department)}</span>
                </div>
                <div className="detail-item">
                  <label>Research Group:</label>
                  <span>{prototype.research_group || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Student Level:</label>
                  <span>{prototype.student?.level_display  || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Academic Year:</label>
                  <span>{prototype.academic_year || 'N/A'}</span>
                </div>
                <div className="detail-item">
              <label>Supervisors:</label>
              <ul className="supervisors-list">
                {prototype.supervisors && prototype.supervisors.length > 0 ? (
                  prototype.supervisors.map((sup) => (
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
          </h4>              
          <div className="detail-item full-width">
                <label>Abstract:</label>
                <div className="abstract-text">
                  {prototype.abstract || 'No abstract provided'}
                </div>
              </div>
            </div>

            {/* Status & Logistics Section */}
            <div className="detail-section">
            <h4 className="section-title">
              <i className="fas fa-clipboard-check mr-2"></i>
              {/* Alternative: <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> */}
              Status & Logistics
            </h4>              
            <div className="detail-grid">
                <div className="detail-item">
                  <label>Status:</label>
                  <span>{getStatusDisplay(prototype.status)}</span>
                </div>
                <div className="detail-item">
                  <label>Physical Prototype:</label>
                  <span>{prototype.has_physical_prototype ? "Yes" : "No"}</span>
                </div>
                <div className="detail-item">
                  <label>Barcode:</label>
                  <span>{prototype.barcode || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Storage Location:</label>
                  <span>{prototype.storage_location || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Submission Date:</label>
                  <span>
                    {prototype.submission_date 
                      ? new Date(prototype.submission_date).toLocaleString() 
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            {prototype.feedback && (
              <div className="detail-section">
            <h4 className="section-title">
                <i className="fas fa-comment-dots mr-2"></i>
                {/* Alternative: <FontAwesomeIcon icon={faCommentDots} className="mr-2" /> */}
                Feedback
              </h4>                
              <div className="feedback-text">
                  {prototype.feedback}
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
                {prototype.attachment?.report && (
                  renderAttachmentLink(prototype.attachment.report, "Download Report", "fa-file-pdf")
                )}
                {prototype.attachment?.source_code && (
                  renderAttachmentLink(prototype.attachment.source_code, "Download Source Code", "fa-code")
                )}

                {renderAttachmentLink(prototype.project_link, "Project URL", "fa-external-link")}
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
      
      <Modal.Footer className="modal-footer">
        <Button variant="outline-secondary" onClick={onHide} className="close-btn">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewPrototypeModal;