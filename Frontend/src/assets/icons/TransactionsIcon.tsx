import React from 'react';

type Props = {
  className?: string;
};

const TransactionsIcon: React.FC<Props> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h13l-3-3" />
    <path d="M18 8l2 2-2 2" />
    <path d="M20 17H7l3 3" />
    <path d="M6 16l-2-2 2-2" />
  </svg>
);

export default TransactionsIcon;
