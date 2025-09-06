import { Job } from '../../types/workerTypes';

interface JobCardProps {
  job: Job;
  language: 'en' | 'hi';
  hasActiveJob: boolean;
  onSelect: (jobId: number) => void;
  onAccept: (jobId: number) => void;
}

export const JobCard = ({ job, language, hasActiveJob, onSelect, onAccept }: JobCardProps) => {
  const handleCardClick = () => {
    // A worker should be able to view details of any of their ongoing or completed jobs.
    if (job.workerStatus === 'ongoing' || job.workerStatus === 'completed') {
      onSelect(job.id);
    }
  };

  const handleAcceptClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's click event from firing
    onAccept(job.id);
  };

  const ActionButton = () => {
    // --- THIS IS THE FIX ---
    // The code now correctly checks `job.workerStatus` instead of `job.status`.
    // This will make the "Accept" button appear for new jobs.
    if (job.workerStatus === 'new') {
      return (
        <button 
          onClick={handleAcceptClick} 
          disabled={hasActiveJob} 
          className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={hasActiveJob ? "You must complete your current job first" : "Accept this job"}
        >
          {language === 'en' ? 'Accept' : 'स्वीकार करें'}
        </button>
      );
    }
    if (job.workerStatus === 'ongoing') {
      return <div className="mt-4 text-center text-blue-600 font-semibold bg-blue-50 p-2 rounded-md">{language === 'en' ? 'Work In Progress' : 'काम चल रहा है'}</div>;
    }
    if (job.workerStatus === 'completed') {
      return <div className="mt-4 text-center text-green-600 font-semibold bg-green-50 p-2 rounded-md">{language === 'en' ? 'Work Finished' : 'काम पूरा हुआ'}</div>;
    }
    return null;
  };

  return (
    <div onClick={handleCardClick} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm cursor-pointer hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{language === 'en' ? job.service_en : job.service_hi}</h3>
          <p className="text-sm text-gray-600">{job.dateTime}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-green-600">₹{job.earning}</p>
          <p className="text-xs text-gray-500">{job.distance}</p>
        </div>
      </div>
      <ActionButton />
    </div>
  );
};
