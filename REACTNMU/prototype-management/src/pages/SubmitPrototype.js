
import '../pages/Materials/css/SubmitPrototypeModal.css';
import React, { useState, useEffect } from "react";
import api from "../api/api";
import { Modal, Button, Form } from "react-bootstrap";
import Select from 'react-select';

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JS months are 0-indexed

  const start = month < 10 ? year - 1 : year; // Sept (10) is the cutoff
  return `${start}/${start + 1}`;
};
const SubmitPrototypeModal = ({ show, onHide, onPrototypeSubmitted }) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [hasPhysicalPrototype, setHasPhysicalPrototype] = useState(false);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [supervisorsSelected, setSupervisorsSelected] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentDepartment, setStudentDepartment] = useState("");
  const [studentLevel, setStudentLevel] = useState("");
  const [report, setReport] = useState(null);
  const [sourceCode, setSourceCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projectLink, setProjectLink] = useState("");
  const [researchGroup, setResearchGroup] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("user/profile/");
        const user = res.data;
        setUserRole(user.role);
        setUserId(user.id);

        if (user.role === "student") {
          setStudentDepartment(user.department || "");
          setStudentLevel(user.level || "");
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setError("Unable to load user profile.");
      }
    };

    if (show) {
      fetchUserProfile();
    }
  }, [show]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, supRes] = await Promise.all([
          api.get("departments/"),
          api.get("users/supervisors/")
        ]);

        setDepartments(deptRes.data || []);
        setSupervisors(supRes.data || []);

        if (userRole === "admin") {
          const studentsRes = await api.get("users/students/");
          setStudents(studentsRes.data || []);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to fetch departments or users.");
      }
    };

    if (userRole && show) {
      fetchInitialData();
    }
  }, [userRole, show]);

  useEffect(() => {
    const fetchSelectedStudentDetails = async () => {
      if (userRole === "admin" && selectedStudent) {
        try {
          const res = await api.get(`users/${selectedStudent}/`);
          const student = res.data;
          setStudentDepartment(student.department.name || "");
          setStudentLevel(student.level_display || "");
        } catch (err) {
          console.error("Error fetching selected student info:", err);
        }
      }
    };

    fetchSelectedStudentDetails();
  }, [selectedStudent, userRole]);

  const resetForm = () => {
    setTitle("");
    setAbstract("");
    setHasPhysicalPrototype(false);
    setAcademicYear("");
    setSupervisorsSelected([]);
    setSelectedStudent("");
    setStudentDepartment("");
    setStudentLevel("");
    setReport(null);
    setSourceCode(null);
    setError(null);
    setAcademicYear(getCurrentAcademicYear()); 
    setSupervisorsSelected([]);
  };
  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0] || null);
  };
  

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
  };


  
  const AcademicYearSelect = ({ value, onChange }) => {
    const currentYear = new Date().getFullYear();
    const range = 3;
  
    const academicYears = Array.from({ length: range + 3 }, (_, i) => {
      const start = currentYear - 2 + i;
      return `${start}/${start + 1}`;
    });
  
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select Academic Year</option>
        {academicYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    );
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("academic_year", academicYear);
      formData.append("has_physical_prototype", hasPhysicalPrototype);
      supervisorsSelected.forEach((id) =>
        formData.append("supervisor_ids", id)
      );
            formData.append("project_link", projectLink);
      formData.append("research_group", researchGroup);

      if (report) formData.append("attachment.report", report);
      if (sourceCode) formData.append("attachment.source_code", sourceCode);

      if (userRole === "admin") {
        formData.append("student", selectedStudent);
      }

      await api.post("prototypes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onPrototypeSubmitted) onPrototypeSubmitted();
      resetForm();
      onHide();
    } catch (err) {
      console.error("Submit failed:", err);
      
      // If backend sent field errors
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        const messages = Object.entries(err.response.data)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
        setError(messages);
      } else {
        setError(err.response?.data?.message || "Submission failed.");
      }
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <Modal show={show} onHide={onHide} size="lg" className="classic-modal" onExited={resetForm}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fas fa-plus-circle mr-2"></i>
          {userRole === "admin" ? "Create New Prototype" : "Submit Your Prototype"}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Form onSubmit={handleSubmit} className="prototype-form">
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
                placeholder="Describe your project (minimum 100 characters)"
                required
              />
            </Form.Group>
          </div>

          {/* Academic Details Section */}
          <div className="form-section">
            <h5 className="section-title">
              <i className="fas fa-graduation-cap mr-2"></i>Academic Details
            </h5>
            
            <div className="form-row">
            <Form.Group className="form-group col-md-12">
            <Form.Label>Academic Year</Form.Label>
            <AcademicYearSelect value={academicYear} onChange={setAcademicYear} />
            </Form.Group>
            </div>

            <div className="form-row">
                <Form.Group className="form-group col-md-12">
                  <Form.Label>Research Group</Form.Label>
                  <Form.Select
                  as="select"
                  value={researchGroup}
                  onChange={(e) => setResearchGroup(e.target.value)}
                >
                    <option value="">Select a research group</option>
                    <option value="smart_elecrtonics">Smart Electronics System Development Management</option>
                    <option value="ai">AI and Complexity System</option>
                    <option value="cyber">Cyber Security and Privacy</option>
                    <option value="wireless_mobile_computing">Wireless and Mobile Computing</option>
                    <option value="mathematical_modeling">Mathematical Modeling and Computational Science</option>
                  </Form.Select>
                </Form.Group>
                </div>

            {userRole === "admin" && (
              <div className="form-row">
                <Form.Group className="form-group col-md-12">
                  <Form.Label>Assign to Student</Form.Label>
                  <Select
                    options={students.map((student) => ({
                      value: student.id,
                      label: student.full_name||student.username || student.email
                    }))}
                    value={
                      selectedStudent
                        ? { value: selectedStudent, label: (students.find(s => s.id === selectedStudent)?.full_name || students.find(s => s.id === selectedStudent)?.email) }
                        : null
                    }
                    onChange={(selectedOption) => setSelectedStudent(selectedOption ? selectedOption.value : '')}
                    placeholder="Select a student..."
                    isClearable
                  />
                </Form.Group>
              </div>
            )}

                <Form.Group className="form-group col-md-12">
                  <Form.Label>student Level</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={studentLevel} 
                    readOnly 
                    placeholder="Will auto-populate"
                  />
                </Form.Group>
                <Form.Group className="form-group col-md-12">
                  <Form.Label>Department</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={studentDepartment} 
                    readOnly 
                    placeholder="Will auto-populate"
                  />
                </Form.Group>

                <Form.Group className="form-group">
                <Form.Label>Supervisors (Max 5)</Form.Label>
                <Select
                  isMulti
                  options={supervisors.map((sup) => ({
                    value: sup.id,
                    label: sup.full_name||sup.username || sup.email
                  }))}
                  value={supervisorsSelected.map((id) => {
                    const sup = supervisors.find(s => s.id === id);
                    return { value: sup.id, label: sup.full_name||sup.username || sup.email };
                  })}
                  onChange={(selectedOptions) => {
                    if (selectedOptions.length <= 5) {
                      setSupervisorsSelected(selectedOptions.map((opt) => opt.value));
                    }
                  }}
                  placeholder="Select up to 5 supervisors..."
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
                <small className="text-muted">You can select up to 5 supervisors. Start typing to search.</small>
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

              <Form.Group className="form-group col-md-12">
                <Form.Label>Project URL</Form.Label>
                <div className="file-upload">
                  <Form.Control
                    type="url"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    />
                  <small className="form-text">
                  Optional: Link to your project (GitHub, live demo, etc.)
                  </small>
  
                </div>
              </Form.Group>
            </div>
          </div>

          <div className="classic-modal-footer">
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
             style={{backgroundColor:'#64A293',border:'none'}}
              type="submit" 
              className="classic-modal-btn classic-modal-btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="fas fa-spinner fa-spin mr-2" role="status"></span>
                  Submitting...
                </>
              ) : (
                <>
                <i className="fas fa-save mr-2"style={{ color: 'white' }}></i>
                {userRole === "admin" ? "Create Prototype" : "Submit Prototype"}
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SubmitPrototypeModal;