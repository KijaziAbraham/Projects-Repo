import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import api from "../api/api";
import "./assets/css/ReviewPrototypeModal.css";

const ReviewPrototypeModal = ({ show, onHide, prototypeId, onReviewSubmitted }) => {
  const [prototype, setPrototype] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (prototypeId && show) {
      fetchPrototypeDetails();
    } else {
      // Reset state when modal closes
      setPrototype(null);
      setFeedback("");
      setError(null);
      setSuccess(null);
    }
  }, [prototypeId, show]);

  const fetchPrototypeDetails = async () => {
    try {
      const response = await api.get(`prototypes/${prototypeId}/`);
      setPrototype(response.data);
    } catch (err) {
      console.error("Failed to fetch prototype details", err);
      setError("Failed to load prototype details.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError("Please provide feedback before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.post(`prototypes/${prototypeId}/review_prototype/`, { feedback });

      setSuccess("Review submitted successfully!");
      setFeedback("");
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      setTimeout(onHide, 1500);
    } catch (err) {
      console.error("Failed to submit review", err);
      setError(err.response?.data?.message || "Failed to submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Modal show={show} onHide={onHide} size="lg" className="review-prototype-modal" centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fas fa-clipboard-check mr-2"></i>
          Review Prototype
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="modal-body">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {prototype ? (
          <Form onSubmit={handleSubmitReview}>
            <div className="prototype-info">
              <div className="info-item">
                <span className="info-label">Title:</span>
                <span className="info-value">{prototype.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Abstract:</span>
                <p className="info-value abstract">{prototype.abstract}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Student:</span>
                <span className="info-value">{prototype.student?.full_name || prototype.student || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span>{getStatusDisplay(prototype.status)}</span>
              </div>
            </div>

          

            <Form.Group className="form-group">
              <Form.Label>Your Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback about the prototype..."
                required
                disabled={submitting}
              />
              <small className="form-text">
                Be constructive and specific in your feedback
              </small>
            </Form.Group>

            <div className="form-actions">
              <Button 
                variant="outline-secondary" 
                onClick={onHide} 
                className="cancel-btn"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                style={{backgroundColor: '#64A293', border: 'none'}}
                type="submit" 
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </Form>
        ) : (
          <div className="loading-state">
            <Spinner animation="border" variant="primary" />
            <p>Loading prototype details...</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReviewPrototypeModal;