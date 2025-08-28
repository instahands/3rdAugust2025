// src/admin/pages/WorkerManagementPage.tsx

import ManagementPage from '../components/shared/ManagementPage';
import { Profile } from '../../shared/types/types';

interface WorkerManagementPageProps {
  workers: Profile[];
  onAdd: () => void;
  onEdit: (worker: Profile) => void;
  onDelete: (id: string | number) => void;
}

const WorkerManagementPage = ({ workers, onAdd, onEdit, onDelete }: WorkerManagementPageProps) => {
  const workerColumns = [
    { 
      key: 'name' as keyof Profile, 
      header: 'Worker Name', 
      render: (item: Profile) => (
        <div>
            <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
            <p className="text-sm text-gray-500">{item.email}</p>
        </div>
      )
    },
    { 
      key: 'created_at' as keyof Profile, 
      header: 'Join Date', 
      render: (item: Profile) => new Date(item.created_at).toLocaleDateString() 
    },
    { 
      key: 'role' as keyof Profile, 
      header: 'Role',
      render: (item: Profile) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          {item.role}
        </span>
      )
    },
    { key: 'actions' as const, header: 'Actions' },
  ];

  return (
    <ManagementPage<Profile>
      title="Worker Management"
      data={workers}
      columns={workerColumns}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default WorkerManagementPage;
