// src/worker/pages/OrderDetailsPage.tsx (CORRECTED)

import { Job } from '../types/workerTypes';
import { Timer } from '../components/details/Timer';
// FIX: Corrected import to use a default export
import WorkerDirectionsMap from '../components/details/WorkerDirectionsMap';
import { supabase } from '../../shared/lib/supabaseClient';

interface OrderDetailsPageProps {
  job: Job;
  language: 'en' | 'hi';
  onBack: () => void;
  onShowOtp: (jobId: number, action: 'start' | 'complete') => void;
  onConfirmPayment: (jobId: number, method: 'Cash' | 'Worker QR') => void;
  workerPosition: { lat: number; lng: number } | null;
  geolocationError: string | null;
}

export const OrderDetailsPage = ({ job, language, onBack, onShowOtp, onConfirmPayment, workerPosition, geolocationError }: OrderDetailsPageProps) => {
  const canStartWork = job.payment_method === 'prepaid' || (job.payment_method === 'cod' && job.payment_status.startsWith('Paid'));

  const handleArrived = async () => {
    const { error } = await supabase.from('orders').update({ tracking_status: 'Arrived' }).eq('id', job.id);
    if (error) {
      console.error("Error updating status:", error);
    }
  };

  const ActionButton = () => {
    if (job.tracking_status === 'On the Way') {
      return (
        <button
          onClick={handleArrived}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
        >
          {language === 'en' ? 'I\'ve Arrived' : 'मैं पहुंच गया हूं'}
        </button>
      );
    }
    if (job.tracking_status === 'Arrived' && canStartWork) {
      return (
        <button
          onClick={() => onShowOtp(job.id, 'start')}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
        >
          {language === 'en' ? 'Start Work' : 'काम शुरू करें'}
        </button>
      );
    }
    if (job.tracking_status === 'Work Started') {
      return (
        <button
          onClick={() => onShowOtp(job.id, 'complete')}
          className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600"
        >
          {language === 'en' ? 'Complete Work' : 'काम पूरा करें'}
        </button>
      );
    }
    return null;
  };

  const PaymentSection = () => {
    if (job.payment_method === 'cod' && job.payment_status === 'Pending' && job.tracking_status === 'Arrived') {
      return (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-yellow-400">
          <h4 className="font-bold text-gray-700 mb-2">{language === 'en' ? 'Collect Payment to Start' : 'काम शुरू करने के लिए भुगतान एकत्र करें'}</h4>
          <p className="text-sm text-gray-600 mb-3">{language === 'en' ? `Please collect ₹${job.earning} from the customer.` : `कृपया ग्राहक से ₹${job.earning} एकत्र करें।`}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onConfirmPayment(job.id, 'Cash')}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
            >
              {language === 'en' ? 'Cash Received' : 'नकद प्राप्त हुआ'}
            </button>
            <button
              onClick={() => onConfirmPayment(job.id, 'Worker QR')}
              className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600"
            >
              {language === 'en' ? 'QR Payment Received' : 'QR भुगतान प्राप्त हुआ'}
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <header className="bg-white p-4 shadow-md sticky top-0 z-10 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-600">←</button>
        <h2 className="text-lg font-bold text-gray-800">{language === 'en' ? 'Job Details' : 'कार्य विवरण'}</h2>
      </header>

      <div className="p-4 space-y-4 pb-24">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-bold text-xl mb-2">{language === 'en' ? job.service_en : job.service_hi}</h3>
          <p className="text-gray-600 text-sm">{job.dateTime}</p>
        </div>

        {(job.tracking_status === 'Work Started' || job.tracking_status === 'Completed') && (
          <Timer startTime={job.start_time ?? null} endTime={job.end_time} language={language} isCompleted={job.tracking_status === 'Completed'} />
        )}
        
        {job.tracking_status === 'Completed' && (
          <div className="p-4 bg-white rounded-lg shadow-sm border border-green-300">
            <h4 className="font-bold text-gray-700 mb-2">
              {language === 'en' ? 'Payment Details' : 'भुगतान विवरण'}
            </h4>
            <div className="space-y-1 text-gray-800">
              <p>
                <strong>{language === 'en' ? 'Amount Paid:' : 'राशि का भुगतान:'}</strong>
                <span className="font-bold text-green-600 ml-2">₹{job.earning}</span>
              </p>
              <p>
                <strong>{language === 'en' ? 'Payment Status:' : 'भुगतान की स्थिति:'}</strong>
                <span className="ml-2">{job.payment_status}</span>
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-bold text-gray-700 mb-2">{language === 'en' ? 'Customer Details' : 'ग्राहक विवरण'}</h4>
          <p className="text-gray-800">{job.customerName}</p>
          <p className="text-gray-600">{job.address}</p>
          <a href={`tel:${job.customerPhone}`} className="text-sm text-green-600 font-semibold">{job.customerPhone}</a>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-bold text-gray-700 mb-2">{language === 'en' ? 'Work Details' : 'काम का विवरण'}</h4>
          <p className="text-gray-600 text-sm">{language === 'en' ? job.workDetails_en : job.workDetails_hi}</p>
        </div>

        {(job.tracking_status === 'On the Way' || job.tracking_status === 'Arrived') && (
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-bold text-gray-700 mb-2">{language === 'en' ? 'Directions to Customer' : 'ग्राहक के लिए दिशा-निर्देश'}</h4>
            <div className="h-80 rounded-lg overflow-hidden border border-gray-200 mt-2">
              <WorkerDirectionsMap 
                origin={workerPosition} 
                destination={job.address}
                geolocationError={geolocationError}
              />
            </div>
          </div>
        )}

        <PaymentSection />
        
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-t-lg">
          <div className="max-w-md mx-auto">
            <ActionButton />
          </div>
        </div>
      </div>
    </div>
  );
};
