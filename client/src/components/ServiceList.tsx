import React from 'react';
import ServiceCard from './ServiceCard';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  required_documents: string;
  fee: number;
}

interface ServiceListProps {
  services: Service[];
}

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  if (services.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
        No services found for this category.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};

export default ServiceList;
