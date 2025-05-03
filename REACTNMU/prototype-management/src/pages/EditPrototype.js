import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../api/api";
import "../pages/Materials/css/SubmitPrototypeModal.css"; // Reusing the same CSS

const EditPrototype = ({ show, onHide, prototypeId, onPrototypeUpdated }) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [hasPhysicalPrototype, setHasPhysicalPrototype] = useState(false);
  const [report, setReport] = useState(null);
  const [sourceCode, setSourceCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialReport, setInitialReport] = useState(null);
  const [initialSourceCode, setInitialSourceCode] = useState(null);

  useEffect(() => {
    const fetchPrototype = async () => {
      if (!prototypeId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`prototypes/${prototypeId}/`);
        setTitle(response.data.title || "");
        setAbstract(response.data.abstract || "");
        setHasPhysicalPrototype(response.data.has_physical_prototype || false);
        setInitialReport(response.data.attachment?.report || null);
        setInitialSourceCode(response.data.attachment?.source_code || null);
        setReport(null);
        setSourceCode(null);
      } catch (error) {
        console.error("Error fetching prototype:", error);
        setError("Failed to load prototype details for editing.");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchPrototype();
    } else {
      // Reset state when modal is closed
      setTitle("");
      setAbstract("");
      setHasPhysicalPrototype(false);
      setReport(null);
      setSourceCode(null);
      setError(null);
      setLoading(false);
    }
  }, [prototypeId, show]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();

    formData.append("title", title);
    formData.append("abstract", abstract);
    formData.append("has_physical_prototype", hasPhysicalPrototype);

    if (report) {
      formData.append("attachment.report", report);
    }
    if (sourceCode) {
      formData.append("attachment.source_code", sourceCode);
    }

    try {
      await api.patch(`prototypes/${prototypeId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPrototypeUpdated();
      onHide();
    } catch (error) {
      console.error("Error updating prototype:", error);
      setError(error.response?.data?.detail || "Failed to update prototype.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0] || null);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="classic-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fas fa-edit mr-2"></i>
          Edit Prototype
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="classic-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading prototype details for editing...
        </div>
            
        ) : (
          <Form onSubmit={handleUpdate} className="prototype-form">
            {/* Basic Information Section */}
            <div className="form-section">
              <h5 className="section-title">
                <i className="fas fa-info-circle mr-2"></i>Basic Information
              </h5>
              
              <Form.Group className="form-group">
                <Form.Label>Project Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your project title"
                  required
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Abstract</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Describe your project"
                  required
                />
              </Form.Group>
            </div>

            {/* Additional Information Section */}
            <div className="form-section">
              <h5 className="section-title">
                <i className="fas fa-cubes mr-2"></i>Additional Information
              </h5>
              
              <Form.Group className="">
                <Form.Check
                  type="checkbox"
                  id="physical-prototype"
                  label="This project includes a physical prototype"
                  checked={hasPhysicalPrototype}
                  onChange={(e) => setHasPhysicalPrototype(e.target.checked)}
                />
              </Form.Group>

              <div className="form-row">
                <Form.Group className="form-group col-md-12">
                  <Form.Label>Project Report</Form.Label>
                  {initialReport && (
                    <div className="mb-2">
                      <span className="current-file">
                        Current file: <a href={initialReport} target="_blank" rel="noopener noreferrer">View</a>
                      </span>
                      <small className="d-block text-muted">(Uploading a new file will replace the current one)</small>
                    </div>
                  )}
                  <div className="file-upload">
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange(setReport)}
                    />
                    <small className="form-text">
                      PDF or Word document (max 10MB)
                    </small>
                    {report && (
                      <div className="file-selected">
                        <i className="fas fa-check-circle text-success"></i>
                        {report.name}
                      </div>
                    )}
                  </div>
                </Form.Group>

                <Form.Group className="form-group col-md-12">
                  <Form.Label>Source Code</Form.Label>
                  {initialSourceCode && (
                    <div className="mb-2">
                      <span className="current-file">
                        Current file: <a href={initialSourceCode} target="_blank" rel="noopener noreferrer">View</a>
                      </span>
                      <small className="d-block text-muted">(Uploading a new file will replace the current one)</small>
                    </div>
                  )}
                  <div className="file-upload">
                    <Form.Control
                      type="file"
                      accept=".zip,.rar"
                      onChange={handleFileChange(setSourceCode)}
                    />
                    <small className="form-text">
                      Compressed archive (ZIP/RAR, max 20MB)
                    </small>
                    {sourceCode && (
                      <div className="file-selected">
                        <i className="fas fa-check-circle text-success"></i>
                        {sourceCode.name}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="form-actions">
            <Button 
              variant="outline-secondary" 
              onClick={onHide} 
              className="classic-modal-btn classic-modal-btn-cancel" 
              disabled={loading}>
               <i className="fas fa-times mr-2"></i>

                Cancel
              </Button>
              <Button 
                style={{backgroundColor:'#64A293',border:'none'}}
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2" style={{ color: 'white' }}></i>
                    Update Prototype
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditPrototype;