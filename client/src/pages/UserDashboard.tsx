import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ServiceList from '../components/ServiceList';
import api from '../api';
import { Activity, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  required_documents: string;
  fee: number;
}

interface Application {
  id: number;
  service_name: string;
  status: string;
  created_at: string;
  remarks: string | null;
  documents_count: number;
}

const UserDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All Services');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [servicesRes, appsRes] = await Promise.all([
          api.get('/services/'),
          api.get('/applications/my')
        ]);
        setServices(servicesRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(services.map(s => s.category).filter(Boolean));
    return Array.from(uniqueCategories).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'All Services') return services;
    return services.filter(s => s.category === activeCategory);
  }, [services, activeCategory]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved': return <span className="badge badge-approved"><CheckCircle size={12} style={{display: 'inline', marginRight: '4px'}}/> Approved</span>;
      case 'Rejected': return <span className="badge badge-rejected"><XCircle size={12} style={{display: 'inline', marginRight: '4px'}}/> Rejected</span>;
      default: return <span className="badge badge-pending"><Clock size={12} style={{display: 'inline', marginRight: '4px'}}/> Pending</span>;
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="dashboard-container">
        <Sidebar 
          categories={categories} 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        <main className="main-content-area">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '1.75rem', color: 'var(--text-dark)' }}>
              Welcome back, User
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
              Access and manage your district services easily.
            </p>
          </div>

          {/* Stats/Quick Info (Optional but good for professional look) */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: 1, minWidth: '200px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: '#eff6ff', color: 'var(--primary-color)' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>Pending</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{applications.filter(a => a.status === 'Pending').length}</div>
              </div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: '200px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: '#ecfdf5', color: 'var(--success-color)' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>Approved</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{applications.filter(a => a.status === 'Approved').length}</div>
              </div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: '200px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: '#fff1f2', color: 'var(--danger-color)' }}>
                <XCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{applications.length}</div>
              </div>
            </div>
          </div>

          {/* Recent Applications Section */}
          <section style={{ marginBottom: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary-color)" /> My Recent Applications
            </h3>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {applications.length === 0 ? (
                 <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>You have no applications yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th>Submission Date</th>
                        <th>Status</th>
                        <th>Documents</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{app.service_name}</td>
                          <td>{new Date(app.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>{getStatusBadge(app.status)}</td>
                          <td><span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{app.documents_count} Files</span></td>
                          <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                            {app.remarks || 'No remarks yet'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Available Services Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary-color)" /> {activeCategory}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', backgroundColor: 'white', padding: '0.4rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color)', fontWeight: 500 }}>
                {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'} Available
              </div>
            </div>
            
            <ServiceList services={filteredServices} />
          </section>

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
