// src/components/booking/BookingSlotModal.tsx
import { useState } from 'react';
import { XIcon } from '../common/Icons';

interface BookingSlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (slot: string, date: string) => void;
    timeSlots: { [key: string]: string[] };
    isSlotDisabled: (slot: string, date: string) => boolean;
    getFormattedDate: (offset: number) => string;
}

export default function BookingSlotModal({ isOpen, onClose, onConfirm, timeSlots, isSlotDisabled, getFormattedDate }: BookingSlotModalProps) {
    if (!isOpen) return null;

    const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');

    const handleSlotSelect = (slot: string) => {
        const date = selectedDay === 'today' ? getFormattedDate(0) : getFormattedDate(1);
        onConfirm(slot, date);
        onClose();
    };

    const allSlots = [...timeSlots['Morning'], ...timeSlots['Afternoon']];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Choose your Booking Slot</h2>
                    <button onClick={onClose}><XIcon /></button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => setSelectedDay('today')} className={`p-3 rounded-lg text-sm font-semibold ${selectedDay === 'today' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Today</button>
                    <button onClick={() => setSelectedDay('tomorrow')} className={`p-3 rounded-lg text-sm font-semibold ${selectedDay === 'tomorrow' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Tomorrow</button>
                </div>

                <p className="text-sm font-bold text-gray-700 mb-2">Select Time</p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {allSlots.map(slot => (
                        <button
                            key={slot}
                            onClick={() => handleSlotSelect(slot)}
                            disabled={isSlotDisabled(slot, selectedDay === 'today' ? getFormattedDate(0) : getFormattedDate(1))}
                            className="p-3 bg-gray-100 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-green-100"
                        >
                            {slot}
                        </button>
                    ))}
                </div>
                 <p className="text-xs text-gray-500 mt-4 text-center">
                    Note: The partner will arrive at your address for the selected slot.
                </p>
            </div>
        </div>
    );
}