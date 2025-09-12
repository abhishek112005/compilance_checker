import React from 'react';

interface GlassyCardProps {
  children: React.ReactNode;
  title?: string;
}

const GlassyCard: React.FC<GlassyCardProps> = ({ children, title }) => {
  return (
    <div className="glassy-card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
};

export default GlassyCard;

