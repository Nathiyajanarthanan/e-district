import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.1rem' }}>{service.name}</h4>
        <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-color)', padding: '0.2rem 0.6rem', borderRadius: '1rem', color: 'var(--text-light)', border: '1px solid var(--border-color)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
          {service.category}
        </span>
      </div>
      <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1, lineHeight: '1.5' }}>
        {service.description}
      </p>
      <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <strong style={{ color: 'var(--text-dark)' }}>Required Documents:</strong><br/>
        <span style={{ color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>{service.required_documents || 'None'}</span>
      </div>
      <Link to={`/apply/${service.id}`} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '0.6rem' }}>
        <PlusCircle size={18} /> Apply Now
      </Link>
    </div>
  );
};

export default ServiceCard;
