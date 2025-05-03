import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import api from "../api/api";
import './assets/css/AssignModal.css'; // Reusing the same CSS

const AssignStorageModal = ({ show, onHide, prototypeId, onStorageAssigned }) => {
  const [storageLocation, setStorageLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (prototypeId && show) {
      fetchPrototypeDetails();
    } else {
      // Reset state when modal is closed
      setStorageLocation("");
      setError(null);
      setSuccess(null);
    }
  }, [prototypeId, show]);

  const fetchPrototypeDetails = async () => {
    try {
      const response = await api.get(`prototypes/${prototypeId}/`);
      setStorageLocation(response.data.storage_location || "");
    } catch (error) {
      console.error("Error fetching prototype details:", error);
      setError("Failed to load prototype details");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(
        `prototypes/${prototypeId}/assign_storage/`,
        { storage_location: storageLocation.trim() }
      );
      
      setSuccess("Storage location updated successfully!");
      if (onStorageAssigned) {
        onStorageAssigned();
      }
      setTimeout(onHide, 1500); // Close modal after showing success
    } catch (error) {
      console.error("Error assigning storage:", error);
      setError(error.response?.data?.message || "Failed to assign storage location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" className="classic-modal" centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fas fa-boxes mr-2"></i>
          Assign Storage Location
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSave} className="prototype-form">
          <div className="form-section">
            <Form.Group className="form-group">
              <Form.Label>Storage Location</Form.Label>
              <Form.Control
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g., Shelf A3, Room 101, Cabinet B2"
                required
                disabled={loading}
              />
              <small className="form-text text-muted">
                Specify the exact physical location where the prototype is stored
              </small>
            </Form.Group>
          </div>

          <div className="form-actions">
            <Button 
              variant="outline-secondary" 
              onClick={onHide} 
              className="classic-modal-btn classic-modal-btn-cancel" 
              disabled={loading}
            >
             <i className="fas fa-times mr-2"></i>

              Cancel
            </Button>
            <Button 
              style={{backgroundColor: '#64A293', border: 'none'}}
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                <i className="fas fa-save mr-2"style={{ color: 'white' }}></i>
                Save Location
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AssignStorageModal;