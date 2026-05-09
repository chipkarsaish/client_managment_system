import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  FileText, 
  Network, 
  LogOut,
  Hexagon,
  MapPin
} from 'lucide-react';
import './Layout.css';

const Sidebar = () => {
  const location = useLocation();

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/clients', label: 'Clients', icon: <Users size={18} /> },
      ]
    },
    {
      title: "Management",
      items: [
        { path: '/add-client', label: 'Add Client', icon: <UserPlus size={18} /> },
        { path: '/documents', label: 'Documents', icon: <FileText size={18} /> },
        { path: '/locations', label: 'Locations', icon: <MapPin size={18} /> },
      ]
    },
    {
      title: "Analytics & Visuals",
      items: [
        { path: '/family-tree', label: 'Family Tree', icon: <Network size={18} /> },
      ]
    }
  ];

  const handleLogout = () => {
    // Elegant dummy logout interaction
    const confirmLogout = window.confirm("Are you sure you want to log out of ClientSync?");
    if (confirmLogout) {
      console.log("Logging out user...");
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <Hexagon size={26} className="sidebar-logo-icon" />
          <div className="sidebar-logo-glow" />
        </div>
        <span className="sidebar-brand-name">ClientSync</span>
      </div>

      <nav className="sidebar-menu">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="sidebar-group">
            <h3 className="sidebar-group-title">{group.title}</h3>
            <div className="sidebar-group-items">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    {isActive && <div className="sidebar-active-indicator" />}
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-item-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-branding">
          <div className="sidebar-footer-brand-row">
            <Hexagon size={15} className="sidebar-footer-brand-icon" />
            <span className="sidebar-footer-brand-text">ClientSync</span>
          </div>
          <div className="sidebar-footer-version">Version 1.0.0</div>
          <div className="sidebar-footer-copyright">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

