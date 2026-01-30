import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { subscribeToUserCollection } from '../utils/userDataHelper';
import { useAuth } from '../contexts/AuthContext';
import './labcss/labtheme.css';

export default function LabNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [batches, setBatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  
  const { user, userProfile, logOut } = useAuth();

  // Load data for alert calculations (only when user is authenticated)
  useEffect(() => {
    if (!user) return; // Don't subscribe if not logged in
    
    const unsubs = [];
    
    try {
      unsubs.push(subscribeToUserCollection('ingredients', (data) => {
        setIngredients(data);
      }));
      
      unsubs.push(subscribeToUserCollection('batches', (data) => {
        setBatches(data);
      }));
      
      unsubs.push(subscribeToUserCollection('notifications', (data) => {
        setNotifications(data);
      }));
    } catch (error) {
      console.error('Error subscribing to user data:', error);
    }

    return () => unsubs.forEach(u => u && u());
  }, [user]);

  // Calculate total alerts count
  const alertCount = useMemo(() => {
    let count = 0;
    
    // Low stock ingredients
    count += ingredients.filter(ing => {
      const stock = parseFloat(ing.stockGrams || ing.stock) || 0;
      const minStock = parseFloat(ing.minStockGrams || ing.minStock || 100) || 100;
      return stock < minStock;
    }).length;
    
    // Batch alerts (ready or expiring)
    const today = new Date();
    batches.forEach(batch => {
      if (batch.status === 'curing' && batch.madeDate) {
        const madeDate = new Date(batch.madeDate);
        const readyDate = new Date(madeDate.getTime() + 42 * 24 * 60 * 60 * 1000);
        const daysLeft = Math.ceil((readyDate - today) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) count++;
      }
      if (batch.soapExpiryDate) {
        const expDate = new Date(batch.soapExpiryDate);
        const daysToExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 30) count++;
      }
    });
    
    // Unread custom notifications
    count += notifications.filter(n => !n.read && !n.dismissed).length;
    
    return count;
  }, [ingredients, batches, notifications]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Grouped navigation structure
  const navGroups = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: '🏠',
      path: '/lab/dashboard',
      isLink: true,
    },
    {
      id: 'create',
      label: 'Create',
      icon: '✨',
      items: [
        { path: '/lab', label: 'Calculator', icon: '🧮', exact: true },
        { path: '/lab/recipes', label: 'My Recipes', icon: '📚' },
        { path: '/lab/generator', label: 'AI Generator', icon: '🧠' },
      ]
    },
    {
      id: 'production',
      label: 'Production',
      icon: '🏭',
      items: [
        { path: '/lab/batches', label: 'Batches', icon: '📋' },
        { path: '/lab/quickbatch', label: 'Quick Batch', icon: '⚡' },
        { path: '/lab/inventory', label: 'Inventory', icon: '📦' },
        { path: '/lab/calendar', label: 'Calendar', icon: '📅' },
      ]
    },
    {
      id: 'business',
      label: 'Business',
      icon: '💼',
      items: [
        { path: '/lab/sales', label: 'Sales', icon: '💰' },
        { path: '/lab/reports', label: 'Analytics', icon: '📊' },
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: '🛠️',
      items: [
        { path: '/lab/labels', label: 'Labels', icon: '🏷️' },
        { path: '/lab/templates', label: 'Templates', icon: '📜' },
        { path: '/lab/print', label: 'Print Center', icon: '🖨️' },
      ]
    },
    {
      id: 'more',
      label: 'More',
      icon: '⚙️',
      items: [
        { path: '/lab/notes', label: 'Lab Notes', icon: '📝' },
        { path: '/lab/backup', label: 'Backup', icon: '💾' },
      ]
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname === item.path;
  };

  const isGroupActive = (group) => {
    if (group.isLink) return location.pathname === group.path;
    return group.items?.some(item => isActive(item));
  };

  const handleGroupClick = (group) => {
    if (group.isLink) return;
    setOpenDropdown(openDropdown === group.id ? null : group.id);
  };

  return (
    <>
      <nav className="lab-navbar">
        {/* Logo section */}
        <div className="lab-navbar-brand">
          <Link to="/lab/dashboard" className="lab-navbar-logo">
            <div className="logo-icon">🧪</div>
            <span className="logo-text">Soap Lab</span>
          </Link>
          
          {/* Right side: Alert bell + Profile + Mobile menu button */}
          <div className="navbar-right-section">
            {/* Alert Bell - always visible */}
            <Link to="/lab/notifications" className="navbar-alert-btn" title="Alerts & Notifications">
              <span className="alert-bell">🔔</span>
              {alertCount > 0 && (
                <span className="alert-badge">{alertCount > 99 ? '99+' : alertCount}</span>
              )}
            </Link>
            
            {/* User Profile Menu */}
            <div className="navbar-profile" ref={profileRef}>
              <button 
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title={user?.displayName || user?.email}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-name">{user?.displayName || 'User'}</div>
                    <div className="profile-email">{user?.email}</div>
                    <div className="profile-plan">
                      <span className={`plan-badge ${userProfile?.plan || 'free'}`}>
                        {(userProfile?.plan || 'free').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <Link to="/pricing" className="profile-item" onClick={() => setShowProfileMenu(false)}>
                    <span>💎</span> Upgrade Plan
                  </Link>
                  <Link to="/lab/backup" className="profile-item" onClick={() => setShowProfileMenu(false)}>
                    <span>💾</span> Backup & Export
                  </Link>
                  <button className="profile-item logout" onClick={handleLogout}>
                    <span>🚪</span> Log out
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lab-navbar-mobile-btn"
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
        
        {/* Desktop navigation */}
        <div className="lab-navbar-nav" ref={dropdownRef}>
          {navGroups.map(group => (
            <div key={group.id} className="nav-group">
              {group.isLink ? (
                <Link 
                  to={group.path}
                  className={`nav-group-btn ${isGroupActive(group) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{group.icon}</span>
                  <span className="nav-label">{group.label}</span>
                </Link>
              ) : (
                <>
                  <button 
                    className={`nav-group-btn ${isGroupActive(group) ? 'active' : ''} ${openDropdown === group.id ? 'open' : ''}`}
                    onClick={() => handleGroupClick(group)}
                  >
                    <span className="nav-icon">{group.icon}</span>
                    <span className="nav-label">{group.label}</span>
                    <span className="dropdown-arrow">▾</span>
                  </button>
                  
                  {openDropdown === group.id && (
                    <div className="nav-dropdown">
                      {group.items.map(item => (
                        <Link 
                          key={item.path}
                          to={item.path}
                          className={`dropdown-item ${isActive(item) ? 'active' : ''}`}
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="item-icon">{item.icon}</span>
                          <span className="item-label">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Mobile menu */}
        <div className={`lab-navbar-mobile ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Mobile alerts link at top */}
          <Link 
            to="/lab/notifications" 
            className="mobile-alerts-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Alerts & Notifications</span>
            {alertCount > 0 && (
              <span className="mobile-alert-badge">{alertCount}</span>
            )}
          </Link>
          
          {navGroups.map(group => (
            <div key={group.id} className="mobile-group">
              {group.isLink ? (
                <Link 
                  to={group.path}
                  className={`mobile-group-header ${isGroupActive(group) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{group.icon}</span>
                  <span className="nav-label">{group.label}</span>
                </Link>
              ) : (
                <>
                  <div className="mobile-group-header">
                    <span className="nav-icon">{group.icon}</span>
                    <span className="nav-label">{group.label}</span>
                  </div>
                  <div className="mobile-group-items">
                    {group.items.map(item => (
                      <Link 
                        key={item.path}
                        to={item.path}
                        className={`mobile-item ${isActive(item) ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-label">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </nav>
      
      <style>{`
        .lab-navbar {
          background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(57, 73, 171, 0.3);
        }
        
        .lab-navbar-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
        }
        
        .lab-navbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        
        .logo-icon {
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4em;
          backdrop-filter: blur(10px);
        }
        
        .logo-text {
          font-weight: 700;
          font-size: 1.3em;
          color: #fff;
          letter-spacing: -0.02em;
        }
        
        /* Right section with alert + hamburger */
        .navbar-right-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* Alert Bell Button */
        .navbar-alert-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .navbar-alert-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.05);
        }
        
        .alert-bell {
          font-size: 1.3em;
          filter: grayscale(0);
          transition: all 0.2s ease;
        }
        
        .navbar-alert-btn:hover .alert-bell {
          animation: ring 0.5s ease;
        }
        
        @keyframes ring {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
        }
        
        .alert-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
          color: white;
          font-size: 0.7em;
          font-weight: 700;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }
        
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        /* Profile Menu */
        .navbar-profile {
          position: relative;
        }
        
        .profile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          overflow: hidden;
        }
        
        .profile-btn:hover {
          background: rgba(255,255,255,0.25);
          border-color: rgba(255,255,255,0.5);
        }
        
        .profile-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .profile-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #7c4dff 0%, #536dfe 100%);
        }
        
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 240px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 8px;
          z-index: 200;
          animation: dropdownFadeIn 0.2s ease;
        }
        
        .profile-header {
          padding: 12px;
          text-align: center;
        }
        
        .profile-name {
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }
        
        .profile-email {
          font-size: 0.8rem;
          color: #666;
          margin-top: 2px;
          word-break: break-all;
        }
        
        .profile-plan {
          margin-top: 8px;
        }
        
        .plan-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        
        .plan-badge.free {
          background: #e0e0e0;
          color: #666;
        }
        
        .plan-badge.starter {
          background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
          color: white;
        }
        
        .plan-badge.pro {
          background: linear-gradient(135deg, #7c4dff 0%, #536dfe 100%);
          color: white;
        }
        
        .plan-badge.business {
          background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
          color: #333;
        }
        
        .profile-divider {
          height: 1px;
          background: #e0e0e0;
          margin: 4px 0;
        }
        
        .profile-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: none;
          color: #333;
          font-size: 0.9rem;
          text-decoration: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        
        .profile-item:hover {
          background: #f5f5f5;
        }
        
        .profile-item.logout {
          color: #e53935;
        }
        
        .profile-item.logout:hover {
          background: #ffebee;
        }
        
        /* Mobile menu button */
        .lab-navbar-mobile-btn {
          display: none;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
        }
        
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 22px;
        }
        
        .hamburger span {
          display: block;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        
        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(4px, 4px);
        }
        
        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }
        
        /* Desktop navigation */
        .lab-navbar-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 20px 12px;
        }
        
        .nav-group {
          position: relative;
        }
        
        .nav-group-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.85);
          font-size: 0.9em;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .nav-group-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }
        
        .nav-group-btn.active {
          background: rgba(255,255,255,0.2);
          color: #fff;
        }
        
        .nav-group-btn.open {
          background: rgba(255,255,255,0.2);
        }
        
        .nav-icon {
          font-size: 1.1em;
        }
        
        .dropdown-arrow {
          font-size: 0.7em;
          opacity: 0.7;
          transition: transform 0.2s ease;
        }
        
        .nav-group-btn.open .dropdown-arrow {
          transform: rotate(180deg);
        }
        
        /* Dropdown menu */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 180px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 8px;
          animation: dropdownFadeIn 0.2s ease;
          z-index: 200;
        }
        
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          color: #333;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.9em;
          transition: all 0.15s ease;
        }
        
        .dropdown-item:hover {
          background: #f5f5f5;
        }
        
        .dropdown-item.active {
          background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%);
          color: #fff;
        }
        
        .item-icon {
          font-size: 1.1em;
        }
        
        /* Mobile navigation */
        .lab-navbar-mobile {
          display: none;
          position: fixed;
          top: 66px;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%);
          padding: 20px;
          overflow-y: auto;
          z-index: 99;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        
        .lab-navbar-mobile.open {
          transform: translateX(0);
        }
        
        /* Mobile alerts link */
        .mobile-alerts-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          color: #fff;
          text-decoration: none;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .mobile-alert-badge {
          margin-left: auto;
          min-width: 24px;
          height: 24px;
          padding: 0 8px;
          background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
          color: white;
          font-size: 0.8em;
          font-weight: 700;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mobile-group {
          margin-bottom: 16px;
        }
        
        .mobile-group-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          color: rgba(255,255,255,0.6);
          font-size: 0.85em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none;
        }
        
        a.mobile-group-header {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
        }
        
        a.mobile-group-header.active {
          background: rgba(255,255,255,0.25);
        }
        
        .mobile-group-items {
          margin-top: 4px;
        }
        
        .mobile-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.95em;
          margin: 2px 0;
          transition: all 0.2s ease;
        }
        
        .mobile-item:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .mobile-item.active {
          background: rgba(255,255,255,0.2);
          color: #fff;
          font-weight: 600;
        }
        
        /* Responsive */
        @media (max-width: 900px) {
          .lab-navbar-mobile-btn {
            display: block;
          }
          
          .lab-navbar-nav {
            display: none;
          }
          
          .lab-navbar-mobile {
            display: block;
          }
        }
        
        @media (min-width: 901px) {
          .lab-navbar-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
