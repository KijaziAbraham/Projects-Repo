import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Materials/css/Dashboard.css";
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import SubmitPrototypeModal from "./SubmitPrototype";
import { TbReportAnalytics } from "react-icons/tb";
import { LuOrbit } from "react-icons/lu";
import { Button } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [storageFilter, setStorageFilter] = useState("");
  const [storageLocations, setStorageLocations] = useState([]);
  const [prototypes, setPrototypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prototypeCount, setPrototypeCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availablePrototypeCount, setAvailablePrototypeCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({ labels: [], data: [] });

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleShowSubmitModal = () => setShowSubmitModal(true);
  const handleCloseSubmitModal = () => setShowSubmitModal(false);

  useEffect(() => {
    fetchUser();
    fetchStorageLocations();
    fetchPrototypeCounts();
    fetchMonthlyStats();
  }, [currentYear]);

  useEffect(() => {
    if (user?.role) {
      fetchPrototypes();
    }
  }, [user, searchTerm, storageFilter, currentPage, showSubmitModal]);

  const fetchUser = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchPrototypeCounts = async () => {
    try {
      const response = await api.get("count/");
      setPrototypeCount(response.data.your_count || 0);
      setAvailablePrototypeCount(response.data.available_count || 0);
    } catch (error) {
      console.error("Error fetching prototype counts:", error);
    }
  };

  const fetchPrototypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`prototypes/?search=${searchTerm}&storage_location=${storageFilter}&page=${currentPage}&page_size=10`);
      const data = response.data;
      const fetchedPrototypes = Array.isArray(data) ? data : data.results || [];

      const studentPrototypes = fetchedPrototypes.filter(p => p.student && p.student.id === user.id);
      const otherPrototypes = fetchedPrototypes.filter(p => p.student && p.student.id !== user.id);
      const sortedPrototypes = [...studentPrototypes, ...otherPrototypes];

      setPrototypes(sortedPrototypes);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (error) {
      console.error("Error fetching prototypes:", error);
      setPrototypes([]);
      setAvailablePrototypeCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageLocations = async () => {
    try {
      const response = await api.get("prototypes/storage_locations/");
      setStorageLocations(response.data || []);
    } catch (error) {
      console.error("Error fetching storage locations:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await api.get("30-day-summary/");
      setMonthlyStats(response.data);
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const handleExport = async (format) => {
    if (userRole === 'admin' || userRole === 'staff') {
      try {
        const response = await api.get(`prototypes/export_${format}/`, {
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `prototypes.${format === "excel" ? "xlsx" : "pdf"}`);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error(`Export ${format} error:`, error);
        alert(`Failed to export as ${format}. Please try again.`);
      }
    } else {
      alert("You do not have permission to export prototypes.");
    }
  };

  const navigateToPrototypes = () => {
    navigate("/prototypes");
  };

  const displayedPrototypes = prototypes.slice(0, 6);


  if (loading) return (
    <div className="classic-loading">
      <i className="fas fa-spinner fa-spin"></i> Loading Dashboard...
    </div>
  );

  if (!user) return <div className="classic-no-data">No user data found</div>;

  return (
    <div className="dashboard-container">
      <DashboardSidebar />
      <div className="main-content p-2 shadow-sm">
        <DashboardHeader
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleShowSubmitModal={handleShowSubmitModal}
          userRole={userRole}
        />

        <div className="row mb-4 mx-5 all_cards">
          <div className="col">
            <div className="card gradient-card" style={{borderRadius: '24px' }}>
              <div className="card-body">
                <h5 className="card-title text-white">Your Prototypes</h5>
                <p className="card-text display-4 text-white"><LuOrbit /> <strong>{prototypeCount}</strong></p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card gradient-card" style={{ borderRadius: '24px' }}>
              <div className="card-body">
                <h5 className="card-title text-white">Available Prototypes</h5>
                <p className="card-text display-4 text-white"><TbReportAnalytics /> <strong>{availablePrototypeCount}</strong></p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card bg-image-card text-white" style={{ borderRadius: '24px' }}>
              <div className="">
                <h5 className="card-title" style={{ color: '#64A293', marginLeft: '20px', marginTop: '20px' }}>Your Innovation Hub</h5>
                <p className="card-text text-dark" style={{ marginLeft: '20px' }}>Creative design</p>
              </div>
              <div className="d-flex justify-content-end mb-3 m-2">
                <button className="btn btn-success" style={{ backgroundColor: '#64A293', border: 'none' }}>Start Now</button>
              </div>
            </div>
          </div>
        </div>

        <div className="prototype-btns d-flex justify-content-start mb-4" style={{ marginLeft: '70px' }}>
          <SubmitPrototypeModal
            show={showSubmitModal}
            onHide={handleCloseSubmitModal}
            onPrototypeSubmitted={() => {
              fetchPrototypeCounts();
              fetchPrototypes();
              handleCloseSubmitModal();
            }}
          />
          {(userRole === 'admin' || userRole === 'staff') && (
            <div className="mb-4 mx-5 d-flex gap-2">

               <SubmitPrototypeModal
            show={showSubmitModal}
            onHide={handleCloseSubmitModal}
            onPrototypeSubmitted={() => {
              fetchPrototypeCounts();
              fetchPrototypes();
              handleCloseSubmitModal();
            }}
          />

              <Button variant="outline-primary" onClick={() => handleExport('excel')}>Export as CSV</Button>
              <Button variant="outline-danger" onClick={() => handleExport('pdf')}>Export as PDF</Button>
            </div>
          )}
        </div>

        <div className="row mx-5 justify-content-center align-content-center">
          <div className="col">
            <div className="card recent-prototypes-card " style={{ width: '100%', maxWidth: '1059px', height: '450px', border: '1px solid #EFEFEF', borderRadius: '24px' }}>
              <div className="card-body">
                <h5 className="card-title">Recent Prototypes</h5>
                <div className="row row-cols-1 row-cols-md-3 g-3 mt-1">
                  {displayedPrototypes.map((proto) => (
                    <div key={proto.id} className="col">
                      <div className="prototype-item" style={{ height: '85px', borderLeft: '4px solid #64A293', paddingLeft: '10px' }}>
                        <p className="mb-0">Title: {proto.title || 'Untitled'}</p>
                        <p className="mb-0">
                          Status: {proto.status === 'submitted_not_reviewed'
                            ? 'Submitted (Not Reviewed)'
                            : proto.status === 'submitted_reviewed'
                            ? 'Submitted (Reviewed)'
                            : proto.status || 'Not set'}
                        </p>
                        <p className="mb-0">Student: {proto.student ? `${proto.student.full_name} ` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button className="btn btn-outline-success" onClick={navigateToPrototypes}>Preview All</button>
                </div>
              </div>
            </div>

            <div className="card chart-card mt-4"  style={{ width: '100%', maxWidth: '1059px', height: '350px', border: '1px solid #EFEFEF', borderRadius: '24px' }}>
              <div className="card-body">
                <h5 className="card-title">Monthly Upload Summary (Over 30 days)</h5>
                <div className="w-full md:w-1/2 xl:w-1/3 p-2">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" angle={0} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="uploads" fill="#64A293" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="right-cards">
              <div className="mb-4">
                <div className="card" style={{ width: '100%', maxWidth: '559px', height: '200px', borderRadius: '24px', border: '1px solid #EFEFEF' }}>
                  <div className="card-body">
                    <div className="avatar">
                      <img
                        src={require("./auth/assets/img/man.png")}
                        alt="User Avatar"
                        className="rounded-circle"
                        width="50"
                        height="50"
                      />
                    </div>
                    <h5 className="card-title">Username: {user?.username || 'User Name'}</h5>
                    <p className="card-text">Email: {user?.email || 'user@email.com'}</p>
                    <p className="card-text">Role: {{
                      student: 'Student',
                      admin: 'System Administrator',
                      staff: 'Staff/Faculty',
                      general_user: 'General User',
                    }[userRole] || 'Not set'}
                  </p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="card" style={{ width: '100%', maxWidth: '559px', height: '200px', borderRadius: '24px', border: '1px solid #EFEFEF' }}>
                  <div className="card-body">
                    <h5 className="card-title"><strong>Institution Details</strong></h5>
                    <p className="card-text">University Name: Nelson Mandela University</p>
                    <p className="card-text">Institution ID: {user?.institution_id || 'Not set'}</p>
                    <p className="card-text">Phone number: {user?.phone || 'No contact'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;