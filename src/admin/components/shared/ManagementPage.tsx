// src/admin/components/shared/ManagementPage.tsx

import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { DataItem } from '../../../shared/types/types'; // Corrected import

interface Column<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface ManagementPageProps<T extends DataItem> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string | number) => void;
}

const ManagementPage = <T extends DataItem>({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
}: ManagementPageProps<T>) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusCircle size={20} />
          <span>Add New</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {columns.map((col) => (
                  <th key={String(col.key)} scope="col" className="px-6 py-3">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  {columns.map((col) => (
                    <td key={`${item.id}-${String(col.key)}`} className="px-6 py-4">
                      {col.key === 'actions' ? (
                        <div className="flex items-center gap-4">
                          <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                          <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                        </div>
                      ) : col.render ? (
                        col.render(item)
                      ) : (
                        item[col.key as keyof T] as React.ReactNode
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;
