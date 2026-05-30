// src/admin/pages/BannerManagementPage.tsx

import ManagementPage from '../components/shared/ManagementPage';
import { Banner } from '../../shared/types/types';

interface BannerManagementPageProps {
    banners: Banner[];
    onAdd: () => void;
    onEdit: (banner: Banner) => void;
    onDelete: (id: string | number) => void;
}

const BannerManagementPage = ({ banners, onAdd, onEdit, onDelete }: BannerManagementPageProps) => {
    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'page', header: 'Page' },
        { key: 'section', header: 'Section' },
        {
            key: 'image_url',
            header: 'Image URL',
            render: (item: Banner) => (
                <a href={item.image_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    View banner
                </a>
            )
        },
        { key: 'alt_text', header: 'Alt Text' },
        { key: 'actions', header: 'Actions' }
    ];

    return (
        <ManagementPage
            title="Banner Management"
            data={banners}
            columns={columns}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    );
};

export default BannerManagementPage;
