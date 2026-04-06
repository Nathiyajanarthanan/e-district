import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  Shield, FileText, Download, Check, X, Edit3, 
  LayoutDashboard, FolderOpen, LogOut, Search,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

interface Document {
  id: number;
  file_name: string;
  url: string;
}

interface Application {
  id: number;
  user_name: string;
  user_email: string;
  service_name: string;
  status: string;
  remarks: string | null;
  created_at: string;
  documents_count: number;
  documents?: Document[];
  applicant_name?: string;
  age?: number;
  address?: string;
  phone?: string;
  extra_fields?: Record<string, any>;
}

interface Summary {
  Total: number;
  Pending: number;
  Approved: number;
  Rejected: number;
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #334155' }}>
          <Shield size={28} color="#38bdf8" />
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'white' }}>Admin Portal</h2>
        </div>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Logged in as</div>
          <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{user?.email}</div>
        </div>

        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#3b82f6', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer' }}>
            <LayoutDashboard size={20} /> Applications
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#94a3b8', borderRadius: '0.5rem', fontWeight: 500, cursor: 'not-allowed' }}>
            <FolderOpen size={20} /> Services (Coming Soon)
          </div>
        </nav>

        <div style={{ padding: '1.5rem 1rem' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState('');
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/admin/applications');
      setApplications(data.applications);
      setSummary(data.summary);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const viewDetails = async (appId: number) => {
    try {
      const { data } = await api.get(`/applications/${appId}`);
      setSelectedApp(data);
      setRemarks(data.remarks || '');
    } catch (err) {
      alert("Error fetching application details.");
    }
  };

  const updateStatus = async (appId: number, action: 'approve' | 'reject') => {
    try {
      await api.put(`/admin/application/${appId}/${action}`, { remarks });
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const filteredApps = useMemo(() => {
    let result = applications;
    if (filter !== 'All') {
      result = result.filter(app => app.status === filter);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(app => 
         app.user_name.toLowerCase().includes(lowerSearch) ||
         app.service_name.toLowerCase().includes(lowerSearch) ||
         String(app.id).includes(lowerSearch)
      );
    }
    // Sort so pending stays on top, then by newest
    return result.sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [applications, filter, search]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await api.get(url.replace('/api', ''), { responseType: 'blob' });
      const blobURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobURL;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobURL);
    } catch (err) {
      alert("Failed to download document. Ensure you have the right permissions.");
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Panel...</div>;

  return (
    <AdminLayout>
      <div className="animate-fade-in" style={{ flex: 1 }}>
        <h1 style={{ marginBottom: '2rem', color: 'var(--text-dark)' }}>Application Management</h1>

        {/* Summary Cards */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #94a3b8' }}>
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Applications</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{summary.Total}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending Review</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#d97706' }}>{summary.Pending}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Approved</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#059669' }}>{summary.Approved}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Rejected</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#dc2626' }}>{summary.Rejected}</div>
            </div>
          </div>
        )}

        {/* Modal */}
        {selectedApp && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', margin: '2rem', padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Application #{selectedApp.id}</h2>
                <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}><X size={24} color="var(--text-light)"/></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedApp.service_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</div>
                  <div style={{ marginTop: '0.25rem' }}><span className={`badge badge-${selectedApp.status.toLowerCase()}`}>{selectedApp.status}</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant Name</div>
                  <div style={{ fontWeight: 500 }}>{selectedApp.applicant_name || selectedApp.user_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone & Age</div>
                  <div style={{ fontWeight: 500 }}>{selectedApp.phone || 'N/A'} • {selectedApp.age || 'N/A'} yrs</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</div>
                  <div style={{ fontWeight: 500 }}>{selectedApp.address || 'N/A'}</div>
                </div>
                
                {selectedApp.extra_fields && Object.keys(selectedApp.extra_fields).length > 0 && (
                   <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                      <strong style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>Service-Specific Details:</strong>
                      {Object.entries(selectedApp.extra_fields).map(([key, val]) => (
                         <div key={key} style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.25rem' }}>
                           <span style={{ textTransform: 'capitalize', color: 'var(--text-light)', width: '200px' }}>{key.replace('_', ' ')}</span> 
                           <strong style={{ flex: 1 }}>{String(val)}</strong>
                         </div>
                      ))}
                   </div>
                )}
              </div>

              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--primary-color)"/> Uploaded Documents
              </h4>
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {selectedApp.documents?.map((doc, idx) => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e0e7ff', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{idx + 1}</div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, wordBreak: 'break-all' }}>{doc.file_name}</span>
                    </div>
                    <button onClick={() => handleDownload(doc.url, doc.file_name)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                      <Download size={16}/> View / Download
                    </button>
                  </div>
                ))}
                {(!selectedApp.documents || selectedApp.documents.length === 0) && <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No documents attached.</p>}
              </div>

              <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Admin Official Action</h4>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   Internal Remarks <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 'normal' }}>(Visible to applicant)</span>
                </label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="E.g., Missing parent signature on document #2..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '2.5rem' }}>
                <div style={{ alignSelf: 'center', color: 'var(--text-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> Actions are logged in the database permanently.
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn" 
                    style={{ backgroundColor: 'white', border: '1px solid var(--danger-color)', color: 'var(--danger-color)' }}
                    onClick={() => updateStatus(selectedApp.id, 'reject')}
                  >
                    <X size={18}/> Reject
                  </button>
                  <button 
                    className="btn btn-primary"
                    style={{ backgroundColor: 'var(--success-color)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}
                    onClick={() => updateStatus(selectedApp.id, 'approve')}
                  >
                    <Check size={18}/> Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Application Log</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ position: 'relative' }}>
                 <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                 <input 
                   type="text" 
                   placeholder="Search ID, Name..." 
                   className="form-input" 
                   style={{ paddingLeft: '2rem', width: '250px', padding: '0.5rem 2rem' }}
                   value={search}
                   onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                 />
               </div>
               <select className="form-input" style={{ width: 'auto', padding: '0.5rem 1rem' }} value={filter} onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}>
                 <option value="All">All Statuses</option>
                 <option value="Pending">Pending Only</option>
                 <option value="Approved">Approved</option>
                 <option value="Rejected">Rejected</option>
               </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant Details</th>
                  <th>Service Type</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map(app => (
                  <tr key={app.id} style={{ backgroundColor: app.status === 'Pending' ? '#fffbeb' : 'transparent' }}>
                    <td style={{ fontWeight: 600 }}>#{app.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{app.applicant_name || app.user_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{app.user_email}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{app.service_name}</td>
                    <td style={{ color: 'var(--text-light)' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => viewDetails(app.id)}>
                        <Edit3 size={14}/> Process
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedApps.length === 0 && (
                  <tr>
                     <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                       <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>No applications found</div>
                       <p style={{ marginTop: '0.5rem' }}>Try adjusting your filters or search terms.</p>
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                 Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} entries
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCurrentPage(page)}
                    style={{ padding: '0.5rem 1rem', minWidth: '40px' }}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="btn btn-secondary" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
