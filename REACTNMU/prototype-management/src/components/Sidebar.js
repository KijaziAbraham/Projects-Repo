import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdScience, MdReviews, MdPerson } from 'react-icons/md';
import { TbXboxAFilled } from "react-icons/tb";
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import api from '../api/api';
import './assets/css/Sidebar.css';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return localStorage.getItem('sidebarOpen') === 'false' ? false : !isMobile;
  });
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    localStorage.setItem('sidebarOpen', !isOpen);
  };

  useEffect(() => {
    fetchUser();
    const handleResize = () => {
      const mobileCheck = window.innerWidth <= 768;
      setIsMobileView(mobileCheck);

      if (mobileCheck) {
        setIsOpen(false);
        localStorage.setItem('sidebarOpen', false);
      } else {
        setIsOpen(true);
        localStorage.setItem('sidebarOpen', true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('user/profile/');
      setUser(response.data);
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { path: '/dashboard', icon: <MdDashboard />, text: 'Dashboard' },
          { path: '/prototypes', icon: <MdScience />, text: 'All Prototypes' },
          { path: '/reviews', icon: <MdReviews />, text: 'Reviews' },
          { path: '/profile', icon: <MdPerson />, text: 'Profile' },
          { path: '/admin-dashboard', icon: <TbXboxAFilled />, text: 'Admin Panel' },
        ];
      case 'staff':
        return [
          { path: '/dashboard', icon: <MdDashboard />, text: 'Dashboard' },
          { path: '/prototypes', icon: <MdScience />, text: 'Prototypes' },
          { path: '/reviews', icon: <MdReviews />, text: 'Reviews' },
          { path: '/profile', icon: <MdPerson />, text: 'Profile' },
        ];
      case 'student':
        return [
          { path: '/dashboard', icon: <MdDashboard />, text: 'Dashboard' },
          { path: '/prototypes', icon: <MdScience />, text: 'Prototypes' },
          { path: '/reviews', icon: <MdReviews />, text: 'Reviews' },
          { path: '/profile', icon: <MdPerson />, text: 'Profile' },
        ];
      case 'general_user':
        return [
          { path: '/prototypes', icon: <MdScience />, text: 'Prototypes' },
          { path: '/profile', icon: <MdPerson />, text: 'Profile' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`app-sidebar ${isOpen ? 'open' : 'collapsed'} ${isMobileView ? 'mobile-view' : ''}`}>
      <div className="sidebar-header">
        <h5>
          <span className="logo-icon">P</span>
          {isOpen && !isMobileView && 'PrototypeHub'}
        </h5>
        <button className="sidebar-toggle" style={{marginLeft:'16px' }} onClick={toggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <button
              className={`menu-item ${location.pathname === item.path ? 'active-link' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="menu-item-content">
                <span className="icon">{item.icon}</span>
                {isOpen && !isMobileView && <span className="menu-text">{item.text}</span>}
                {!isOpen && <span className="tooltip">{item.text}</span>}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => navigate('/')}>
          <FaSignOutAlt />
          {isOpen && !isMobileView && 'LOGOUT'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
