// src/admin/pages/OrderManagementPage.tsx (FINAL, CORRECTED CODE)

import ManagementPage from '../components/shared/ManagementPage';
import { Order } from '../../shared/types/types';

interface OrderManagementPageProps {
  orders: Order[];
  onAdd: () => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string | number) => void;
}

const OrderManagementPage = ({ orders, onAdd, onEdit, onDelete }: OrderManagementPageProps) => {
  const orderColumns = [
    {
      key: 'id' as keyof Order,
      header: 'Order ID',
      render: (item: Order) => <span className="font-mono text-xs">{item.id.toString().substring(0, 8)}</span>
    },
    {
      // --- THIS IS THE FIX ---
      // The key and render function now use 'service_name'
      key: 'service_name' as keyof Order,
      header: 'Service',
      render: (item: Order) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{item.service_name}</p>
        </div>
      )
    },
    {
      key: 'date' as keyof Order,
      header: 'Date',
      render: (item: Order) => new Date(item.date).toLocaleDateString()
    },
    {
      key: 'status' as keyof Order,
      header: 'Status',
      render: (item: Order) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          item.status === 'Completed' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      )
    },
    { key: 'actions' as const, header: 'Actions' },
  ];

  return (
    <ManagementPage
      title="Order Management"
      data={orders}
      columns={orderColumns}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default OrderManagementPage;