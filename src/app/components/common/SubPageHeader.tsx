// src/components/common/SubPageHeader.tsx (CORRECTED)

import { ArrowLeftIcon } from './Icons';

// --- NEW: Typed the component props ---
const SubPageHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <div className="relative flex items-center justify-center mb-6">
        <button onClick={onBack} className="absolute left-0 p-2">
            <ArrowLeftIcon />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
);

export default SubPageHeader;