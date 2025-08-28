// src/admin/components/shared/FormComponent.tsx

import { useState, useEffect } from 'react';
import { DataItem } from '../../../shared/types/types'; // Corrected import

interface FormComponentProps {
  item: Partial<DataItem> | null;
  onSave: (item: Partial<DataItem>) => void;
  onCancel: () => void;
}

const FormComponent = ({ item, onSave, onCancel }: FormComponentProps) => {
  const [formData, setFormData] = useState<Partial<DataItem> | null>(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Added type for 'prev' to fix implicit any error
    setFormData((prev: Partial<DataItem> | null) => (prev ? { ...prev, [name]: value } : { [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.keys(formData).map(key => {
        if (key === 'id' || key === 'created_at' || key === 'user_id') return null;

        return (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {key.replace(/_/g, ' ')}
            </label>
            <input
              type="text"
              id={key}
              name={key}
              value={String(formData[key as keyof typeof formData] || '')}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );
      })}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default FormComponent;
