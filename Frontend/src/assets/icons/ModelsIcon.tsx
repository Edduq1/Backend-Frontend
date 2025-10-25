import React from 'react';

type Props = {
  className?: string;
};

// BrainCircuitIcon
const ModelsIcon: React.FC<Props> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21a9 9 0 0 0 9-9c0-5-4-9-9-9s-9 4-9 9a9 9 0 0 0 9 9z" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 21v-2" />
    <path d="M12 5V3" />
    <path d="M19.07 15.5l1.41 1.41" />
    <path d="M3.52 7.07l1.41 1.41" />
    <path d="M2.93 15.5l1.41-1.41" />
    <path d="M20.48 7.07l-1.41-1.41" />
  </svg>
);

export default ModelsIcon;
