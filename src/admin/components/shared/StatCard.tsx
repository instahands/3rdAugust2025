// src/admin/components/shared/StatCard.tsx

import React from 'react';

interface StatCardProps {
  icon: React.ReactElement;
  title: string;
  value: string;
  change: string;
  color: string;
}

const StatCard = ({ icon, title, value, change, color }: StatCardProps) => {
  const changeIsPositive = change.startsWith('+');

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        <p className={`text-xs mt-2 ${changeIsPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </p>
      </div>
      <div className={`p-3 rounded-full bg-opacity-20 ${
          changeIsPositive 
          ? 'bg-green-100 dark:bg-green-900' 
          : 'bg-red-100 dark:bg-red-900'
        } ${color}`
      }>
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
  );
};

export default StatCard;
