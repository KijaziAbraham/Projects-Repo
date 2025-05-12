import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Materials/css/Dashboard.css";
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import SubmitPrototypeModal from "./SubmitPrototype";
import { TbReportAnalytics } from "react-icons/tb";
import { LuOrbit } from "react-icons/lu";
import { FaUserCircle, FaUniversity } from "react-icons/fa";
import { Button } from 'react-bootstrap';
import ClassicPreloader from "./Preloader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  // State management
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [prototypes, setPrototypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prototypeCount, setPrototypeCount] = useState(0);
  const [availablePrototypeCount, setAvailablePrototypeCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Modal handlers
  const handleShowSubmitModal = () => setShowSubmitModal(true);
  const handleCloseSubmitModal = () => setShowSubmitModal(false);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchUser(),
          fetchPrototypeCounts(),
          fetchMonthlyStats(),
          fetchPrototypes()
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.role) {
      fetchPrototypes();
    }
  }, [user, searchTerm]);

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
    try {
      const response = await api.get(`prototypes/?search=${searchTerm}&page_size=6`);
      const data = response.data;
      const fetchedPrototypes = Array.isArray(data) ? data : data.results || [];
      
      // Sort prototypes with user's prototypes first
      const sortedPrototypes = fetchedPrototypes.sort((a, b) => 
        (a.student?.id === user?.id) ? -1 : 1
      );
      
      setPrototypes(sortedPrototypes);
    } catch (error) {
      console.error("Error fetching prototypes:", error);
      setPrototypes([]);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await api.get("30-day-summary/");
      setMonthlyStats(response.data.map(item => ({
        day: item.day,
        uploads: item.uploads,
        name: `${item.day} (${item.uploads})`
      })));
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

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (isLoading) {
    return (
      <div className="dashboard-preloader-container">
        <ClassicPreloader />
      </div>
    );
  }

  if (!user) {
    return <div className="classic-no-data">No user data found</div>;
  }

  return (
    <div className="dashboard-container">
      <DashboardSidebar />
      
      <div className="main-content">
        <DashboardHeader
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleShowSubmitModal={handleShowSubmitModal}
          userRole={userRole}
        />

        <div className="container-fluid px-3 px-md-4 py-3">
          {/* Top Cards Row */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card gradient-card h-100" style={{ borderRadius: '24px', background: 'linear-gradient(90deg, #2D7DDAFF, #49CCB0FF)' }}>
                <div className="card-body">
                  <h5 className="card-title text-white">Your Prototypes</h5>
                  <p className="card-text display-4 text-white" style={{ fontSize: '50px' }}>
                    <LuOrbit /> <strong>{prototypeCount}</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card gradient-card h-100" style={{ borderRadius: '24px', background: 'linear-gradient(90deg, #49CCB0FF, #2D7DDAFF)' }}>
                <div className="card-body">
                  <h5 className="card-title text-white">Available Prototypes</h5>
                  <p className="card-text display-4 text-white" style={{ fontSize: '50px' }}>
                    <TbReportAnalytics /> <strong>{availablePrototypeCount}</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-lg-4">
              <div className="card bg-image-card h-100" style={{ borderRadius: '24px', minHeight: '164px' }}>
                <div className="card-overlay"></div>
                <div className="card-content position-relative h-100 d-flex flex-column">
                  <h5 className="card-title" style={{ color: '#64A293', marginLeft: '20px', marginTop: '20px' }}>Your Innovation Hub</h5>
                  <p className="card-text text-white" style={{ marginLeft: '20px' }}>Creative design</p>
                  <div className="mt-auto d-flex justify-content-end mb-3 mx-2">
                    <Button 
                      variant="success" 
                      style={{ backgroundColor: '#64A293', border: 'none' }}
                      onClick={handleShowSubmitModal}
                    >
                      Start Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-wrap align-items-center mb-4 gap-2">
            {(userRole === 'student' || userRole === 'admin' || userRole === 'staff') && (
              <Button 
                variant="success" 
                style={{ backgroundColor: '#64A293', border: 'none' }}
                onClick={handleShowSubmitModal}
              >
                ADD PROTOTYPE
              </Button>
            )}
            
            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Button variant="outline-primary" onClick={() => handleExport('excel')}>
                  Export as CSV
                </Button>
                <Button variant="outline-danger" onClick={() => handleExport('pdf')}>
                  Export as PDF
                </Button>
              </>
            )}
          </div>

          {/* Main Content Area */}
          <div className="row g-4">
            {/* Left Column */}
            <div className="col-12 col-lg-8">
              <div className="card" style={{ border: '1px solid #EFEFEF', borderRadius: '24px' }}>
                <div className="card-body">
                  <h5 className="card-title">Recent Prototypes</h5>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mt-1">
                    {prototypes.map((proto) => (
                      <div key={proto.id} className="col">
                        <div className="prototype-item h-100" style={{ borderLeft: '4px solid #64A293', paddingLeft: '10px' }}>
                          <p className="mb-1">Title: {proto.title || 'Untitled'}</p>
                          <p className="mb-1 small">
                            Status: {proto.status === 'submitted_not_reviewed'
                              ? 'Submitted (Not Reviewed)'
                              : proto.status === 'submitted_reviewed'
                              ? 'Submitted (Reviewed)'
                              : proto.status || 'Not set'}
                          </p>
                          <p className="mb-0 small">Student: {proto.student?.full_name || 'Unknown'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center text-md-start">
                    <Button 
                      variant="outline-success" 
                      style={{ borderRadius: '20px' }}
                      onClick={navigateToPrototypes}
                    >
                      Preview All
                    </Button>
                  </div>
                </div>
              </div>

              <div className="card mt-4" style={{ border: '1px solid #EFEFEF', borderRadius: '24px' }}>
                <div className="card-body">
                  <h5 className="card-title">Monthly Upload Summary (30 days)</h5>
                  <div className="w-100" style={{ height: '410px' }}>
                    <ResponsiveContainer width="100%" height="100%">
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

            {/* Right Column */}
            <div className="col-12 col-lg-4">
              <div className="card mb-4" style={{ border: '1px solid #EFEFEF', borderRadius: '24px' }}>
                <div className="card-body text-center">
                  <div className="avatar mb-3">
                    <FaUserCircle size={40} style={{ color: '#64A293' }} />
                  </div>
                  <h5 className="card-title"><strong>Username:</strong> {user.username}</h5>
                  <p className="card-text">Email: {user.email}</p>
                  <p className="card-text">
                    Role: {{
                      student: 'Student',
                      admin: 'System Administrator',
                      staff: 'Staff/Faculty',
                      general_user: 'General User',
                    }[userRole] || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="card mb-4" style={{ border: '1px solid #EFEFEF', borderRadius: '24px' }}>
                <div className="card-body text-center">
                  <div className="avatar mb-3">
                    <FaUniversity size={40} style={{ color: '#64A293' }} />
                  </div>
                  <h5 className="card-title"><strong>Institution Details</strong></h5>
                  <p className="card-text">University: Nelson Mandela University</p>
                  <p className="card-text">Institution ID: {user.institution_id || 'Not set'}</p>
                  <p className="card-text">Phone: {user.phone || 'No contact'}</p>
                </div>
              </div>

              <div className="card" style={{ border: '1px solid #EFEFEF', borderRadius: '24px' }}>
                <div className="card-body">
                  <h5 className="card-title text-center"><strong>Upload Distribution (30 days)</strong></h5>
                  {monthlyStats.length > 0 ? (
                    <div style={{ height: '320px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthlyStats}
                            dataKey="uploads"
                            nameKey="day"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={({percent}) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {monthlyStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} uploads`,
                              props.payload.day
                            ]}
                          />
                          <Legend 
                            layout="vertical" 
                            verticalAlign="bottom" 
                            height={36}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="card-text text-muted mt-4 text-center">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubmitPrototypeModal
        show={showSubmitModal}
        onHide={handleCloseSubmitModal}
        onPrototypeSubmitted={() => {
          fetchPrototypeCounts();
          fetchPrototypes();
          handleCloseSubmitModal();
        }}
      />
    </div>
  );
};

export default Dashboard;