// src/worker/components/details/Timer.tsx (FINAL, CORRECTED)
import React, { useState, useEffect } from 'react';

interface TimerProps {
    startTime: string | null;
    endTime?: string | null;
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
    const [elapsedTime, setElapsedTime] = useState(startTime ? new Date().getTime() - new Date(startTime).getTime() : 0);

    useEffect(() => {
        if (isCompleted || !startTime) return;
        const interval = setInterval(() => {
            if (startTime) { // Check if startTime is not null before using it
                setElapsedTime(new Date().getTime() - new Date(startTime).getTime());
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, isCompleted]);

    const title = isCompleted ? (language === 'en' ? 'Work Duration' : 'कार्य अवधि') : (language === 'en' ? 'Time Elapsed' : 'समय व्यतीत हुआ');
    const displayTime = isCompleted && endTime && startTime 
        ? formatDuration(new Date(endTime).getTime() - new Date(startTime).getTime()) 
        : formatDuration(elapsedTime);
    
    const colorClasses = isCompleted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600';

    if (!startTime) return null;

    return (
        <div className={`p-4 rounded-lg shadow-sm ${colorClasses}`}>
            <h4 className="font-bold text-center text-sm mb-2">{title}</h4>
            <p className="text-center text-3xl font-mono font-bold">{displayTime}</p>
        </div>
    );
};