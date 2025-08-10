// src/components/common/SubPageHeader.tsx

import React from 'react';
import { ArrowLeftIcon } from './Icons';

const SubPageHeader = ({ title, onBack }) => (
    <div className="relative flex items-center justify-center mb-6">
        <button onClick={onBack} className="absolute left-0 p-2">
            <ArrowLeftIcon />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
);

export default SubPageHeader;