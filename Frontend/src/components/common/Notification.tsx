// src/components/Dashboard/common/Notification.tsx
import React from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

const Notification: React.FC<NotificationProps> = ({ message, type = 'info' }) => {
  const color =
    type === 'success'
      ? 'bg-green-600/90'
      : type === 'error'
      ? 'bg-red-600/90'
      : 'bg-blue-600/90';

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white shadow-lg ${color} animate-fade-in z-50`}
    >
      {message}
    </div>
  );
};

export default Notification;