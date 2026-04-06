import React from 'react';
import { Layers } from 'lucide-react';

interface SidebarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div style={{ width: '280px', borderRight: '1px solid var(--border-color)', height: '100%', minHeight: 'calc(100vh - 80px)', backgroundColor: '#fff', padding: '1.5rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-dark)', fontSize: '1.2rem' }}>
        <Layers size={20} color="var(--primary-color)" /> Categories
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {['All Services', ...categories].map(category => (
          <li key={category}>
            <button
              onClick={() => onSelectCategory(category)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: activeCategory === category ? 'var(--primary-light)' : 'transparent',
                color: activeCategory === category ? 'var(--primary-color)' : 'var(--text-dark)',
                fontWeight: activeCategory === category ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (activeCategory !== category) e.currentTarget.style.backgroundColor = '#f1f5f9';
              }}
              onMouseOut={(e) => {
                if (activeCategory !== category) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
