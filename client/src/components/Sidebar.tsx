import React, { useState } from 'react';
import { 
  UserCheck, 
  Users, 
  Heart, 
  Info, 
  Landmark, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid
} from 'lucide-react';

interface SidebarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, activeCategory, onSelectCategory }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIcon = (category: string) => {
    switch (category) {
      case 'All Services': return <LayoutGrid className="sidebar-item-icon" size={20} />;
      case 'Personal & Identity Certificates': return <UserCheck className="sidebar-item-icon" size={20} />;
      case 'Family & Relationship Certificates': return <Users className="sidebar-item-icon" size={20} />;
      case 'Social Welfare Certificates': return <Heart className="sidebar-item-icon" size={20} />;
      case 'Special Case Certificates': return <Info className="sidebar-item-icon" size={20} />;
      case 'Property & Financial Certificates': return <Landmark className="sidebar-item-icon" size={20} />;
      case 'Vital Records': return <FileSpreadsheet className="sidebar-item-icon" size={20} />;
      default: return <FileSpreadsheet className="sidebar-item-icon" size={20} />;
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Navigation</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="sidebar-content">
        <button
          onClick={() => onSelectCategory('All Services')}
          className={`sidebar-item ${activeCategory === 'All Services' ? 'active' : ''}`}
          title="All Services"
        >
          {getIcon('All Services')}
          {!isCollapsed && <span className="sidebar-item-text">All Services</span>}
        </button>

        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`sidebar-item ${activeCategory === category ? 'active' : ''}`}
            title={category}
          >
            {getIcon(category)}
            {!isCollapsed && <span className="sidebar-item-text">{category}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
