import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import api from '../../api/api';

const BulkImportModal = ({ show, onHide, fetchUsers }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState({
    actions: false,
    download: false
  });
  const [errors, setErrors] = useState({ users: null });
  const [success, setSuccess] = useState(null);

  const downloadTemplate = async () => {
    try {
      setLoading(prev => ({ ...prev, download: true }));
      const response = await api.get('/admin/download-users-template/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading template:', err);
      setErrors({ users: 'Failed to download template' });
    } finally {
      setLoading(prev => ({ ...prev, download: false }));
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrors({ users: null });
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrors({ users: 'Please select a file to upload' });
      return;
    }

    setLoading(prev => ({ ...prev, actions: true }));
    setErrors({ users: null });
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('excel_file', file);

      const response = await api.post('/admin/import-users/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`Successfully imported ${response.data.success_count} users`);
      if (response.data.errors && response.data.errors.length > 0) {
        setErrors({ users: `${response.data.errors.length} records had errors. First error: ${response.data.errors[0]}` });
      }
      
      fetchUsers(); // Refresh the user list
      setFile(null);
    } catch (err) {
      console.error('Error importing users:', err);
      setErrors({ users: err.response?.data?.message || 'Failed to import users' });
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  if (!show) return null;

  return (
    <div className="classic-modal-overlay active">
      <div className="classic-modal-container">
        <div className="classic-modal-header">
          <h3>
            <i className="fas fa-users mr-2"></i>
            Bulk Import Users
          </h3>
          <button className="classic-modal-close" onClick={onHide}>
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
          
          {success && (
            <div className="classic-modal-success">
              <i className="fas fa-check-circle mr-2"></i>
              {success}
            </div>
          )}

          <div className="classic-form-group">
            <h5>Instructions</h5>
            <ol>
              <li>Download the template file</li>
              <li>Fill in user data following the format</li>
              <li>Upload the completed file</li>
            </ol>
            
            <button 
              className="classic-modal-btn classic-modal-btn-secondary" 
              onClick={downloadTemplate}
              disabled={loading.download}
            >
              {loading.download ? (
                    <i className="fas fa-spinner mr-2"></i>
                ) : (
                    <i className="fas fa-download mr-2"></i>
              )}
              Download Template
            </button>
          </div>

          <Form.Group onSubmit={handleSubmit}>
            <div className="form-group col-md-12">
              <label>Select Excel File</label>
              <input 
                type="file" 
                className="classic-form-control"
                accept=".xlsx, .xls" 
                onChange={handleFileChange}
                disabled={loading.actions}
              />
                <small className="form-text">
                Accepted format (xls, xlsx only)
            </small>
            </div>
          </Form.Group>
        </div>
        
        <div className="classic-modal-footer">
          <button 
            className="classic-modal-btn classic-modal-btn-cancel" 
            onClick={onHide}
            disabled={loading.actions}
          >
            <i className="fas fa-times mr-2"></i>
            Cancel
          </button>
          <button 
            className="classic-modal-btn classic-modal-btn-primary" 
            onClick={handleSubmit}
            disabled={loading.actions || !file}
          >
            {loading.actions ? (
              <>
                    <i className="fas fa-spinner mr-2"></i>
                    Importing...
              </>
            ) : (
              <>
                <i style={{color:'white'}} className="fas fa-upload mr-2"></i>
                Import Users
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;