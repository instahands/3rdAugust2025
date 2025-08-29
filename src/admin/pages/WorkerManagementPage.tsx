// src/admin/pages/WorkerManagementPage.tsx

import ManagementPage from '../components/shared/ManagementPage';
import { Profile } from '../../shared/types/types';
import { CheckCircle, XCircle } from 'lucide-react';

interface WorkerManagementPageProps {
  workers: Profile[];
  onAdd: () => void;
  onEdit: (worker: Profile) => void;
  onDelete: (id: string | number) => void;
  // --- NEW: Add approval and rejection handlers ---
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const WorkerManagementPage = ({ workers, onAdd, onEdit, onDelete, onApprove, onReject }: WorkerManagementPageProps) => {
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
    // --- NEW: Column to display worker status ---
    { 
      key: 'worker_status' as keyof Profile, 
      header: 'Status',
      render: (item: Profile) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          item.worker_status === 'approved' ? 'bg-green-100 text-green-800' :
          item.worker_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.worker_status}
        </span>
      )
    },
    { 
      key: 'actions' as const, 
      header: 'Actions',
      // --- NEW: Render approve/reject buttons for pending workers ---
      render: (item: Profile) => (
        <div className="flex items-center gap-4">
            {item.worker_status === 'pending' && (
                <>
                    <button onClick={() => onApprove(item.id)} className="text-green-500 hover:text-green-700" title="Approve"><CheckCircle size={18} /></button>
                    <button onClick={() => onReject(item.id)} className="text-red-500 hover:text-red-700" title="Reject"><XCircle size={18} /></button>
                </>
            )}
            <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700">Edit</button>
            <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700">Delete</button>
        </div>
      )
    },
  ];

  return (
    <ManagementPage
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
