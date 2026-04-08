import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, CreditCard } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  required_documents: string;
  fee: number;
}

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="service-card">
      <div className="service-card-category">{service.category}</div>
      <h4 className="service-card-title">{service.name}</h4>
      <p className="service-card-desc">{service.description}</p>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem' }}>
          <FileText size={16} /> Required Documents
        </div>
        <div style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
          {service.required_documents.split(',').map((doc, idx) => (
            <div key={idx} style={{ marginBottom: '2px' }}>• {doc.trim()}</div>
          ))}
        </div>
      </div>

      <div className="service-card-footer">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Service Fee</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CreditCard size={14} color="var(--success-color)" />
            <span className="service-fee">₹{service.fee.toFixed(2)}</span>
          </div>
        </div>
        <Link to={`/apply/${service.id}`} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          Apply Now <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
