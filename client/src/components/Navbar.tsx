import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };



  return (
    <nav className="navbar" style={{ position: 'relative', zIndex: 1000 }}>
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
        <Shield color="var(--primary-color)" size={32} />
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>e-District Portal</span>
      </Link>
      
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {isAuthenticated ? (
          <>
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', border: 'none' }}>
              Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
              <UserIcon size={18} />
              <span style={{ fontWeight: 500 }}>{user?.full_name}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ border: 'none' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
