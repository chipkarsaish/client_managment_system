import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, MapPin, Users, User, Network, Sun, Moon } from 'lucide-react';
import api from '../../api/api';
import './Layout.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  };
  
  // Search State
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [persons, setPersons] = useState([]);
  const searchRef = useRef(null);

  // Fetch data for search
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await api.get('/persons');
        setPersons(response.data);
      } catch (error) {
        console.error("Error fetching persons for search:", error);
      }
    };
    fetchPersons();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Time
  useEffect(() => {
    const updateDateTime = () => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      setCurrentDateTime(new Date().toLocaleString('en-US', options));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filtering logic
  const getFilteredResults = () => {
    if (!query.trim()) return { clients: [], actions: [] };
    const q = query.toLowerCase();

    const clients = persons.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.mobile && p.mobile.includes(q))
    ).slice(0, 4);

    const allActions = [
      { id: 'add-client', title: 'Add New Client', subtitle: 'Create a new client profile', path: '/add-client', icon: <Plus size={16} /> },
      { id: 'documents', title: 'Document Tracker', subtitle: 'View all missing and uploaded documents', path: '/documents', icon: <FileText size={16} /> },
      { id: 'locations', title: 'Location Management', subtitle: 'Manage active branches', path: '/locations', icon: <MapPin size={16} /> },
      { id: 'clients', title: 'Client Directory', subtitle: 'View all active clients', path: '/clients', icon: <Users size={16} /> },
      { id: 'family-tree', title: 'Family Tree', subtitle: 'Visualize client family hierarchies', path: '/family-tree', icon: <Network size={16} /> }
    ];

    const actions = allActions.filter(a => 
      a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    ).slice(0, 3);

    return { clients, actions };
  };

  const { clients, actions } = getFilteredResults();
  const showDropdown = isDropdownOpen && query.trim().length > 0;

  const handleClientClick = (clientId) => {
    setIsDropdownOpen(false);
    setQuery("");
    navigate('/clients', { state: { selectedPersonId: clientId } });
  };

  const handleViewFamilyTree = (clientId) => {
    setIsDropdownOpen(false);
    setQuery("");
    navigate('/family-tree', { state: { autoPersonId: clientId } });
  };

  const handleActionClick = (path) => {
    setIsDropdownOpen(false);
    setQuery("");
    navigate(path);
  };

  // Determine page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/add-client') return 'Add Client';
    if (path === '/clients') return 'Clients';
    if (path === '/documents') return 'Documents';
    if (path === '/locations') return 'Locations';
    if (path === '/family-tree') return 'Family Tree';
    if (path === '/upload') return 'Upload Center';
    if (path === '/settings') return 'Settings';
    return 'Client Management';
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-center">
        <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search clients, documents, quick actions..." 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />

          {/* Dropdown */}
          {showDropdown && (
            <div className="search-dropdown">
              
              {/* Clients Section */}
              {clients.length > 0 && (
                <div>
                  <div className="search-section-title">Clients</div>
                  {clients.map(client => (
                    <div key={client.id} className="search-result-item" style={{ alignItems: 'flex-start', gap: '10px' }}>
                      <div className="search-result-icon" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <User size={16} />
                      </div>
                      <div className="search-result-details" style={{ flex: 1 }}>
                        <div className="search-result-title">{client.firstName} {client.lastName}</div>
                        <div className="search-result-subtitle">{client.mobile || 'No mobile'} • ID: #{client.id}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button
                            onClick={() => handleClientClick(client.id)}
                            style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-light-faint)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleViewFamilyTree(client.id)}
                            style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Network size={11} /> Family Tree
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions Section */}
              {actions.length > 0 && (
                <div>
                  <div className="search-section-title">Quick Actions</div>
                  {actions.map(action => (
                    <div 
                      key={action.id} 
                      className="search-result-item"
                      onClick={() => handleActionClick(action.path)}
                    >
                      <div className="search-result-icon">
                        {action.icon}
                      </div>
                      <div className="search-result-details">
                        <div className="search-result-title">{action.title}</div>
                        <div className="search-result-subtitle">{action.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {clients.length === 0 && actions.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <button 
          className="nav-icon-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ marginRight: '8px' }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} style={{ color: '#4f46e5' }} />}
        </button>
        <span className="current-date" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{currentDateTime}</span>
      </div>
    </header>
  );
};

export default Navbar;
