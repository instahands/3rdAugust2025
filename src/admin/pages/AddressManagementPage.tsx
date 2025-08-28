// src/admin/pages/AddressManagementPage.tsx

import ManagementPage from '../components/shared/ManagementPage';
import { Address } from '../../shared/types/types';

interface AddressManagementPageProps {
  addresses: Address[];
  onAdd: () => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string | number) => void;
}

const AddressManagementPage = ({ addresses, onAdd, onEdit, onDelete }: AddressManagementPageProps) => {
  const addressColumns = [
    {
      key: 'user_id' as keyof Address,
      header: 'User ID',
      render: (item: Address) => <span className="font-mono text-xs">{item.user_id.substring(0, 15)}...</span>
    },
    {
      key: 'address_type' as keyof Address,
      header: 'Type',
       render: (item: Address) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {item.address_type}
        </span>
      )
    },
    {
      key: 'street_address' as keyof Address,
      header: 'Street Address',
    },
    {
      key: 'city' as keyof Address,
      header: 'City',
    },
    {
      key: 'phone_number' as keyof Address,
      header: 'Phone',
    },
    { key: 'actions' as const, header: 'Actions' }
  ];

  return (
    <ManagementPage
      title="Address Management"
      data={addresses}
      columns={addressColumns}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default AddressManagementPage;
