import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight, FileText, UploadCloud, Clock } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--primary-color), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Government Services,<br />Simplified & Modernized.
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Apply for certificates, upload unlimited documents securely, and track your status in real-time without artificial paywalls or limitations.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Get Started <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Track Application
          </Link>
        </div>

        <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
          <div className="card">
            <UploadCloud size={40} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }}/>
            <h3 style={{ fontSize: '1.25rem' }}>Unlimited Uploads</h3>
            <p style={{ color: 'var(--text-light)' }}>No arbitrary limits on your document uploads. Attach exactly what you need.</p>
          </div>
          <div className="card">
            <Clock size={40} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }}/>
            <h3 style={{ fontSize: '1.25rem' }}>Real-time Tracking</h3>
            <p style={{ color: 'var(--text-light)' }}>Watch your application progress through each state of approval instantly.</p>
          </div>
          <div className="card">
            <FileText size={40} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }}/>
            <h3 style={{ fontSize: '1.25rem' }}>Premium Design</h3>
            <p style={{ color: 'var(--text-light)' }}>A fast, clean interface ensuring the best citizen experience possible.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
