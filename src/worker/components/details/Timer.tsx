// src/worker/components/details/Timer.tsx
import React, { useState, useEffect } from 'react';

interface TimerProps {
    startTime: number | null;
    endTime?: number | null;
    language: 'en' | 'hi';
    isCompleted: boolean;
}

const formatDuration = (ms: number) => {
    if (!ms || ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const Timer: React.FC<TimerProps> = ({ startTime, endTime, language, isCompleted }) => {
    const [elapsedTime, setElapsedTime] = useState(startTime ? Date.now() - startTime : 0);

    useEffect(() => {
        if (isCompleted || !startTime) return;

        const interval = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, isCompleted]);

    const title = isCompleted ? (language === 'en' ? 'Work Duration' : 'कार्य अवधि') : (language === 'en' ? 'Time Elapsed' : 'समय व्यतीत हुआ');
    const displayTime = isCompleted && endTime && startTime ? formatDuration(endTime - startTime) : formatDuration(elapsedTime);
    const bgColor = isCompleted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600';

    if (!startTime) return null;

    return (
        <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-2">{title}</h4>
            <div className={`text-2xl font-bold text-center p-4 rounded-md ${bgColor}`}>
                {displayTime}
            </div>
        </div>
    );
};
