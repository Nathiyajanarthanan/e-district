import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { Upload, X, ShieldCheck, FileCheck, CheckCircle, CreditCard, Loader2 } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  required_documents: string;
  fee: number;
}

const ApplicationWizard: React.FC = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  
  // Basic Form Fields
  const [applicantName, setApplicantName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address Fields
  const [addressLine, setAddressLine] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateStr, setStateStr] = useState('');
  const [fetchingPin, setFetchingPin] = useState(false);
  
  // Dynamic Form Fields
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // Submission & Payment State
  const [paymentStep, setPaymentStep] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (pincode.length === 6) {
      const fetchLocation = async () => {
        setFetchingPin(true);
        try {
           const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
           const data = await res.json();
           if (data && data[0].Status === "Success") {
             const postOffice = data[0].PostOffice[0];
             setCity(postOffice.District);
             setStateStr(postOffice.State);
           }
        } catch (err) {
           console.error("Pincode error", err);
        } finally {
           setFetchingPin(false);
        }
      };
      fetchLocation();
    }
  }, [pincode]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await api.get('/services/');
        const found = data.find((s: Service) => s.id === Number(serviceId));
        if (found) setService(found);
      } catch (err) {
        console.error("Error fetching service", err);
      }
    };
    fetchService();
  }, [serviceId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => {
        if (file.type.startsWith('image/')) return URL.createObjectURL(file);
        return '';
      });
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please upload at least one document.");
      return;
    }
    
    // Instead of submitting, proceed to payment step
    setPaymentStep(true);
  };

  const processPaymentAndSubmit = async () => {
    setProcessingPayment(true);
    
    // Mock a 1.5 second payment processing delay (Razorpay/Stripe simulation)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingPayment(false);
    
    // Now actually submit the payload to the server
    setLoading(true);
    const formData = new FormData();
    formData.append('service_id', String(serviceId));
    formData.append('applicant_name', applicantName);
    formData.append('age', age);
    
    // Combine address for backend compatibility
    const fullAddress = `${addressLine}, ${city}, ${stateStr} - ${pincode}`;
    formData.append('address', fullAddress);
    
    formData.append('phone', phone);
    formData.append('extra_fields', JSON.stringify(extraFields));
    
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      await api.post('/applications/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application.");
      setPaymentStep(false);
    } finally {
      setLoading(false);
    }
  };

  const getDynamicFields = () => {
    if (!service) return null;
    if (service.name.includes("Income")) {
      return (
        <div className="form-group">
          <label className="form-label">Annual Family Income (₹)</label>
          <input type="number" className="form-input" required value={extraFields['annual_income'] || ''} onChange={e => setExtraFields({...extraFields, annual_income: e.target.value})} />
        </div>
      );
    } else if (service.name.includes("Birth")) {
      return (
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input type="date" className="form-input" required value={extraFields['dob'] || ''} onChange={e => setExtraFields({...extraFields, dob: e.target.value})} />
        </div>
      );
    } else if (service.name.includes("Caste")) {
      return (
        <div className="form-group">
          <label className="form-label">Caste Category (e.g., SC/ST/OBC)</label>
          <input type="text" className="form-input" required value={extraFields['caste_category'] || ''} onChange={e => setExtraFields({...extraFields, caste_category: e.target.value})} />
        </div>
      );
    }
    return null;
  };

  if (!service) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '3rem' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 2rem' }}>
        
        {success ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Payment & Application Successful!</h2>
            <p style={{ color: 'var(--text-light)' }}>Transaction ID: TXN{Math.floor(Math.random() * 100000000)}</p>
            <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Redirecting to your dashboard...</p>
          </div>
        ) : paymentStep ? (
          <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', background: '#e0e7ff', borderRadius: '50%', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CreditCard size={32} />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Payment Gateway Simulation</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Securely processing payment for {service.name}</p>
            
            <div style={{ display: 'inline-block', textAlign: 'left', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '2rem', minWidth: '300px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                 <span style={{ color: 'var(--text-light)' }}>Applicant:</span>
                 <strong style={{ color: 'var(--text-dark)' }}>{applicantName}</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)', fontSize: '0.95rem' }}>
                 <span style={{ color: 'var(--text-light)' }}>Service Fee:</span>
                 <strong style={{ color: 'var(--text-dark)' }}>₹{service.fee}</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
                 <span>Total Amount</span>
                 <span style={{ color: 'var(--primary-color)' }}>₹{service.fee}</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setPaymentStep(false)}
                disabled={processingPayment || loading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={processPaymentAndSubmit}
                disabled={processingPayment || loading}
                style={{ minWidth: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {processingPayment ? <><Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 
                 loading ? 'Finalizing...' : `Pay ₹${service.fee}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="card animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', background: '#e0e7ff', borderRadius: '50%', color: 'var(--primary-color)' }}>
                <FileCheck size={32} />
              </div>
              <div>
                <h2>Apply for {service.name}</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>{service.description}</p>
              </div>
            </div>

            <form onSubmit={handleInitialSubmit}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>1. Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={applicantName} onChange={e => setApplicantName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-input" required value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                   <label className="form-label">Street Address / House No.</label>
                   <textarea className="form-input" rows={2} required value={addressLine} onChange={e => setAddressLine(e.target.value)} placeholder="e.g. 123 Main Street" />
                </div>
                <div className="form-group">
                   <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     Pincode {fetchingPin && <Loader2 size={14} className="animate-spin text-blue-500" />}
                   </label>
                   <input type="text" maxLength={6} className="form-input" required value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 110001" />
                </div>
                <div className="form-group">
                   <label className="form-label">City / District</label>
                   <input type="text" className="form-input" required value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                   <label className="form-label">State</label>
                   <input type="text" className="form-input" required value={stateStr} onChange={e => setStateStr(e.target.value)} />
                </div>
                <div className="form-group">
                   <label className="form-label">Phone Number</label>
                   <input type="tel" className="form-input" required value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <h3 style={{ marginBottom: '1.5rem', marginTop: '1rem', color: 'var(--primary-color)' }}>2. Service Specifics</h3>
              {getDynamicFields()}

              <h3 style={{ marginBottom: '1.5rem', marginTop: '2rem', color: 'var(--primary-color)' }}>3. Document Upload</h3>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
                 <ShieldCheck size={24} color="var(--success-color)"/>
                 <div style={{ fontSize: '0.9rem' }}>
                   <strong>No Limitations!</strong> Upload exactly as many documents as you need. Typically required: {service.required_documents}
                 </div>
              </div>

              <div className="form-group">
                <div style={{ border: '2px dashed var(--border-color)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', background: '#f8fafc', position: 'relative', transition: 'border-color 0.2s', cursor: 'pointer' }}>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  <Upload size={32} color="var(--text-light)" style={{ margin: '0 auto 1rem auto' }}/>
                  <p style={{ fontWeight: 500 }}>Click to browse or drag and drop files here</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>PDF, JPG, PNG allowed.</p>
                </div>

                {files.length > 0 && (
                  <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {files.map((file, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                        {previews[i] ? (
                          <img src={previews[i]} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                             <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>PDF / DOC</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }} title={file.name}>
                            {file.name}
                          </span>
                          <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.9rem' }}>
                  Proceeding to Payment Integration.<br/>
                  <strong>Government Fee: ₹{service.fee}</strong>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2.5rem' }}>
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationWizard;
