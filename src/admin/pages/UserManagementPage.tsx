// src/admin/pages/UserManagementPage.tsx

import ManagementPage from '../components/shared/ManagementPage';
import { Profile } from '../../shared/types/types'; // Corrected import from master types file

interface UserManagementPageProps {
    users: Profile[];
    onAdd: () => void;
    onEdit: (user: Profile) => void;
    onDelete: (id: string | number) => void; // Corrected to match prop type
}

const UserManagementPage = ({ users, onAdd, onEdit, onDelete }: UserManagementPageProps) => {
    const userColumns = [
        { 
            key: 'name' as keyof Profile, 
            header: 'Name', 
            render: (item: Profile) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                        {item.name ? item.name.substring(0, 2).toUpperCase() : 'NA'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.email}</p>
                    </div>
                </div>
            )
        },
        { 
            key: 'created_at' as keyof Profile, 
            header: 'Join Date', 
            render: (item: Profile) => new Date(item.created_at).toLocaleDateString() 
        },
        { key: 'role' as keyof Profile, header: 'Role' },
        { key: 'actions' as const, header: 'Actions' },
    ];

    return (
        <ManagementPage
            title="User Management"
            data={users}
            columns={userColumns}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
};

export default UserManagementPage;
