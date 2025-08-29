// src/worker/pages/OrderDetailsPage.tsx
import { Job } from '../types/workerTypes';
import { Timer } from '../components/details/Timer';

interface OrderDetailsPageProps {
  job: Job;
  language: 'en' | 'hi';
  onBack: () => void;
  onShowOtp: (jobId: number, action: 'start' | 'complete') => void;
}

export const OrderDetailsPage = ({ job, language, onBack, onShowOtp }: OrderDetailsPageProps) => {
  const ActionButton = () => {
    if (job.trackingStatus === 'Assigned') {
      return <button onClick={() => onShowOtp(job.id, 'start')} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600">{language === 'en' ? 'Start Work' : 'काम शुरू करें'}</button>;
    }
    if (job.trackingStatus === 'On the Way') {
      return <button onClick={() => onShowOtp(job.id, 'complete')} className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600">{language === 'en' ? 'Complete Work' : 'काम पूरा करें'}</button>;
    }
    return null;
  };

  return (
    <div>
      <header className="bg-white p-4 shadow-md sticky top-0 z-10 flex items-center">
        <button onClick={onBack} className="mr-4">{'< Back'}</button>
        <h1 className="text-lg font-bold text-gray-800">Order Details</h1>
      </header>
      <main className="p-4 space-y-4 pb-24">
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-bold text-lg text-gray-800">{language === 'en' ? job.service_en : job.service_hi}</h3>
            <p className="text-gray-600">{job.customerName}</p>
            <p className="text-sm text-gray-500">{job.address}</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-sm text-center">
            <h3 className="font-semibold text-gray-700 mb-2">Job Status</h3>
            {/* --- FIX: Compare job.status with 'completed' --- */}
            <p className={`font-semibold ${job.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>{job.trackingStatus}</p>
        </div>

        {(job.trackingStatus === 'On the Way' || job.status === 'completed') && (
            // --- FIX: Compare job.status with 'completed' ---
            <Timer startTime={job.startTime} endTime={job.endTime} language={language} isCompleted={job.status === 'completed'} />
        )}

        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-bold text-gray-700 mb-2">Work Details</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{language === 'en' ? job.workDetails_en : job.workDetails_hi}</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-bold text-gray-700 mb-2">Location ({job.distance})</h4>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-gray-200">
                 <iframe title="map" src={job.mapUrl} width="100%" height="200" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <a href={job.directionsUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center mt-4 bg-gray-100 py-2 rounded-lg font-semibold hover:bg-gray-200">Get Directions</a>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
        <ActionButton />
      </footer>
    </div>
  );
};