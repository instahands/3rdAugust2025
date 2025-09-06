import ManagementPage from '../components/shared/ManagementPage';
import { Order } from '../../shared/types/types';

interface OrderManagementPageProps {
  orders: Order[];
  onAdd: () => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string | number) => void;
}

const OrderManagementPage = ({ orders, onAdd, onEdit, onDelete }: OrderManagementPageProps) => {
  const getPaymentStatusColor = (status: string) => {
    if (status.startsWith('Paid')) return 'bg-green-100 text-green-800';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const orderColumns = [
    {
      key: 'id' as keyof Order,
      header: 'Order ID',
      render: (item: Order) => <span className="font-mono text-xs">{item.id.toString().substring(0, 8)}</span>
    },
    {
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
      header: 'Job Status',
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
    {
      key: 'payment_status' as keyof Order,
      header: 'Payment',
      render: (item: Order) => (
        <div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(item.payment_status)}`}>
              {item.payment_status}
            </span>
             <p className="text-xs text-gray-500 mt-1 capitalize">{item.payment_method}</p>
        </div>
      )
    },
    { key: 'actions' as const, header: 'Actions' }
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