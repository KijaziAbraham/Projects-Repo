import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import api from '../api/api';
import "../pages/Materials/css/ReviewPrototype.css";
import { TiCloudStorage } from "react-icons/ti";
import { Dropdown } from 'react-bootstrap';
import { PencilSquare, Eye, ChatDots } from 'react-bootstrap-icons';
import ViewPrototypeModal from './ViewPrototype';
import EditPrototypeModal from './EditPrototype';
import ClassicPreloader from "./Preloader";
import ReviewPrototypeModal from "../components/ReviewPrototypeModal";
import AssignStorageModal from '../components/AssignStorageModal';

const ITEMS_PER_PAGE = 10;

const ReviewPrototypes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prototypes, setPrototypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]); 
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrototypeIdForView, setSelectedPrototypeIdForView] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrototypeIdForEdit, setSelectedPrototypeIdForEdit] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPrototypeIdForReview, setSelectedPrototypeIdForReview] = useState(null);
  const [showAssignStorageModal, setShowAssignStorageModal] = useState(false);
  const [selectedPrototypeForAssignStorage, setSelectedPrototypeForAssignStorage] = useState(null);
  const [storageLocations, setStorageLocations] = useState([]);
  const [storageFilter, setStorageFilter] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  // Classic Pagination Component
  const ClassicPagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 3;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        
        if (currentPage <= 3) {
          end = 4;
        } else if (currentPage >= totalPages - 2) {
          start = totalPages - 3;
        }
        
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
      
      return pages;
    };

    return (
      <div className="classic-pagination">
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          &laquo;
        </button>
        
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="pagination-ellipsis">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-arrow"
        >
          &raquo;
        </button>
      </div>
    );
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, deptsRes, studentsRes] = await Promise.all([
          api.get("user/profile/"),
          api.get("departments/"),
          api.get("users/students/")
        ]);
        
        setUser(userRes.data);
        setDepartments(deptsRes.data || []);
        setStudents(studentsRes.data || []);
        
        if (userRes.data?.role) {
          const prototypesRes = await api.get(
            `prototypes/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`
          );
          setPrototypes(prototypesRes.data.results || prototypesRes.data || []);
          setTotalItems(prototypesRes.data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = `prototypes/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`;
        
        if (searchTerm) endpoint += `&search=${searchTerm}`;
        if (storageFilter) endpoint += `&storage_location=${storageFilter}`;
        if (departmentFilter && user?.role !== 'student') {
          endpoint += `&department_filter=${departmentFilter}`;
        }

        const response = await api.get(endpoint);
        setPrototypes(response.data.results || response.data || []);
        setTotalItems(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching prototypes:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, currentPage, departmentFilter, searchTerm, storageFilter]);

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.username : 'N/A';
  };

  const handleViewClick = (prototypeId) => {
    setSelectedPrototypeIdForView(prototypeId);
    setShowViewModal(true);
  };

  const handleEditClick = (prototypeId) => {
    setSelectedPrototypeIdForEdit(prototypeId);
    setShowEditModal(true);
  };

  const handleReviewClick = (prototypeId) => {
    setSelectedPrototypeIdForReview(prototypeId);
    setShowReviewModal(true);
  };

  const handleAssignStorageClick = (prototypeId) => {
    setSelectedPrototypeForAssignStorage(prototypeId);
    setShowAssignStorageModal(true);
  };

  const handleDepartmentChange = (departmentId) => {
    setDepartmentFilter(departmentId);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (initialLoad) {
    return (
      <div className="classic-loading">
        <ClassicPreloader/>
      </div>
    );
  }

  if (!user) return <div className="classic-no-data">No user data found</div>;

  return (
    <div className='dashboard-layout'>
      <DashboardSidebar />
      <div className="main-content">
        <DashboardHeader       
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="review-prototypes-container">
          <h2 className="classic-profile-title">
            <i className="fas fa-comments mr-2"></i>Review Prototype
          </h2>
          
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <div className="mb-3">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-department">
                  Filter by Department {departmentFilter && departments.find(dept => dept.id === departmentFilter)?.name ? `(${departments.find(dept => dept.id === departmentFilter)?.name})` : ''}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleDepartmentChange('')}>All Departments</Dropdown.Item>
                  {departments.map(department => (
                    <Dropdown.Item key={department.id} onClick={() => handleDepartmentChange(department.id)}>
                      {department.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}

          <div className="table-responsive">
            <table className="prototypes-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Project Name</th>
                  <th>Project Barcode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prototypes.length > 0 ? (
                  prototypes.map((prototype) => (
                    <tr key={prototype.id}>
                      <td data-label="Student ID">{prototype.student?.id}</td>
                      <td data-label="Student Name">{prototype.student?.full_name || getStudentName(prototype.student)}</td>
                      <td data-label="Project Name">{prototype.title || 'Untitled'}</td>
                      <td data-label="Barcode">{prototype.barcode || 'N/A'}</td>
                      <td data-label="Status">
                        {prototype.status === 'submitted_not_reviewed' && <span className="status-badge not-reviewed">Not Reviewed</span>}
                        {prototype.status === 'submitted_reviewed' && <span className="status-badge reviewed">Reviewed</span>}
                      </td>
                      <td data-label="Actions" className="actions-cell">
                        <div className="action-buttons">
                          <button 
                            className="btn btn-info btn-sm view-btn" 
                            style={{backgroundColor:'#64A293',border:'none', color:'white'}} 
                            onClick={() => handleViewClick(prototype.id)}
                          >
                            <Eye /> <span className="btn-text">View</span>
                          </button>

                          {user?.role === 'student' && prototype.student.id === user.id && (
                            <button 
                              className="btn btn-warning btn-sm edit-btn" 
                              onClick={() => handleEditClick(prototype.id)}
                            >
                              <PencilSquare /> <span className="btn-text">Edit</span>
                            </button>
                          )}
                         
                          {(user?.role === 'staff' || user?.role === 'admin') && (
                            <>
                              <button 
                                className="btn btn-primary btn-sm review-btn" 
                                onClick={() => handleReviewClick(prototype.id)}
                              >
                                <ChatDots /> <span className="btn-text">Review</span>
                              </button>

                              <button 
                                className="btn btn-secondary btn-sm storage-btn" 
                                onClick={() => handleAssignStorageClick(prototype.id)}
                              >
                                <TiCloudStorage /> <span className="btn-text"> Assign Storage</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-prototypes">
                      {user?.role === 'student' ? "You haven't submitted any prototypes yet." : "No prototypes found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modals */}
          <ViewPrototypeModal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            prototypeId={selectedPrototypeIdForView}
          />
          <EditPrototypeModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            prototypeId={selectedPrototypeIdForEdit}
          />
          <ReviewPrototypeModal
            show={showReviewModal}
            onHide={() => setShowReviewModal(false)}
            prototypeId={selectedPrototypeIdForReview}
          />
          <AssignStorageModal
            show={showAssignStorageModal}
            onHide={() => setShowAssignStorageModal(false)}
            prototypeId={selectedPrototypeForAssignStorage}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <ClassicPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPrototypes;