import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdScience, MdReviews, MdPerson } from 'react-icons/md';
import { TbXboxAFilled } from "react-icons/tb";
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useUser } from './context/UserContext'; 
import './assets/css/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser(); // Get user from context instead of local state
  const [isOpen, setIsOpen] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return localStorage.getItem('sidebarOpen') === 'false' ? false : !isMobile;
  });
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('sidebarOpen', newState);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth <= 768;
      setIsMobileView(mobileCheck);

      if (mobileCheck) {
        setIsOpen(false);
        localStorage.setItem('sidebarOpen', false);
      } else {
        // Only set to true if it was previously open
        const shouldOpen = localStorage.getItem('sidebarOpen') !== 'false';
        setIsOpen(shouldOpen);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMenuItems = () => {
    if (!user?.role) return []; // Return empty if no user role
    
    const commonItems = [
      { path: '/dashboard', icon: <MdDashboard />, text: 'Dashboard' },
      { path: '/prototypes', icon: <MdScience />, text: 'Prototypes' },
      { path: '/reviews', icon: <MdReviews />, text: 'Reviews' },
      { path: '/profile', icon: <MdPerson />, text: 'Profile' },
    ];

    switch (user.role) {
      case 'admin':
        return [...commonItems, 
          { path: '/admin-dashboard', icon: <TbXboxAFilled />, text: 'Admin Panel' }
        ];
      case 'general_user':
        return [
          { path: '/prototypes', icon: <MdScience />, text: 'Prototypes' },
          { path: '/profile', icon: <MdPerson />, text: 'Profile' },
        ];
      default:
        return commonItems;
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
        <button 
          className="sidebar-toggle" 
          style={{ marginLeft: '16px' }} 
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <button
              className={`menu-item ${location.pathname === item.path ? 'active-link' : ''}`}
              onClick={() => navigate(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <div className="menu-item-content">
                <span className="icon">{item.icon}</span>
                {isOpen && !isMobileView && (
                  <span className="menu-text">{item.text}</span>
                )}
                {!isOpen && (
                  <span className="tooltip" role="tooltip">{item.text}</span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
  <button 
    className="logout-btn" 
    onClick={() => navigate('/')}
    aria-label="Logout"
  >
    <FaSignOutAlt className="icon" />
    {isOpen && !isMobileView && 'LOGOUT'}
    <span className="tooltip" role="tooltip">Logout</span>
  </button>
</div>
    </div>
  );
};

export default Sidebar;