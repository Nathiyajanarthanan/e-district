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
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          categories={categories} 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--text-dark)' }}>
            <Activity color="var(--primary-color)" /> My Dashboard
          </h2>

          {/* Recent Applications Card */}
          <div className="card" style={{ marginBottom: '2rem', maxWidth: '1000px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              My Applications
            </h3>
            {applications.length === 0 ? (
               <p style={{ color: 'var(--text-light)' }}>You have no applications yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Submitted On</th>
                      <th>Documents</th>
                      <th>Status</th>
                      <th>Admin Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: 500 }}>{app.service_name}</td>
                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                        <td><FileText size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> {app.documents_count} Files</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>{app.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Available Services */}
          <div style={{ maxWidth: '1000px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
              <span>Available Certificates: {activeCategory}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 'normal', backgroundColor: 'var(--bg-color)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
              </span>
            </h3>
            <ServiceList services={filteredServices} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
