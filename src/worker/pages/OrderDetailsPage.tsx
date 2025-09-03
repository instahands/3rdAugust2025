import { Job } from '../types/workerTypes';
import { Timer } from '../components/details/Timer';

interface OrderDetailsPageProps {
  job: Job;
  language: 'en' | 'hi';
  onBack: () => void;
  onShowOtp: (jobId: number, action: 'start' | 'complete') => void;
  onConfirmPayment: (jobId: number, method: 'Cash' | 'Worker QR') => void;
}

export const OrderDetailsPage = ({ job, language, onBack, onShowOtp, onConfirmPayment }: OrderDetailsPageProps) => {
    
  const canStartWork = job.payment_method === 'prepaid' || (job.payment_method === 'cod' && job.payment_status.startsWith('Paid'));

  const ActionButton = () => {
    if (job.tracking_status === 'Assigned' && canStartWork) {
      return <button onClick={() => onShowOtp(job.id, 'start')} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600">Start Work</button>;
    }
    if (job.tracking_status === 'On the Way') {
      return <button onClick={() => onShowOtp(job.id, 'complete')} className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600">Complete Work</button>;
    }
    return null;
  };

  const PaymentSection = () => {
      if (job.payment_method === 'cod' && job.payment_status === 'Pending') {
          return (
              <div className="p-4 bg-white rounded-lg shadow-sm border border-yellow-400">
                  <h4 className="font-bold text-gray-700 mb-2">Collect Payment Before Starting</h4>
                  <p className="text-sm text-gray-600 mb-3">Please collect ₹{job.earning} from the customer.</p>
                  <div className="flex space-x-2">
                    <button 
                        onClick={() => onConfirmPayment(job.id, 'Cash')}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
                    >
                        Cash Received
                    </button>
                    <button 
                        onClick={() => onConfirmPayment(job.id, 'Worker QR')}
                        className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600"
                    >
                        QR Payment Received
                    </button>
                  </div>
              </div>
          );
      }
      return null;
  }

  return (
    <div>
      <header className="bg-white p-4 shadow-md sticky top-0 z-10 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-600">&#x2190;</button>
        <h2 className="text-lg font-bold text-gray-800">{language === 'en' ? 'Job Details' : 'कार्य विवरण'}</h2>
      </header>
      <div className="p-4 space-y-4 pb-24">
        {/* Job Details */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-bold text-xl mb-2">{language === 'en' ? job.service_en : job.service_hi}</h3>
            <p className="text-gray-600 text-sm">{job.dateTime}</p>
        </div>

        {/* Timer */}
        {(job.tracking_status === 'On the Way' || job.tracking_status === 'Completed') && (
            <Timer startTime={job.startTime} endTime={job.endTime} language={language} isCompleted={job.tracking_status === 'Completed'} />
        )}
        
        {/* Customer Details */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-bold text-gray-700 mb-2">Customer Details</h4>
            <p className="text-gray-800">{job.customerName}</p>
            <p className="text-gray-600">{job.address}</p>
             <a href={`tel:${job.customerPhone}`} className="text-sm text-green-600 font-semibold">{job.customerPhone}</a>
        </div>
        
        {/* Work Details */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-bold text-gray-700 mb-2">Work Details</h4>
            <p className="text-gray-600 text-sm">{language === 'en' ? job.workDetails_en : job.workDetails_hi}</p>
        </div>

        {/* Map */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-bold text-gray-700 mb-2">Location ({job.distance})</h4>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-gray-200">
                 <iframe title="map" src={job.mapUrl} width="100%" height="200" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <a href={job.directionsUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center mt-4 bg-gray-100 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200">Get Directions</a>
        </div>

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
