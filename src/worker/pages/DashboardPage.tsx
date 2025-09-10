// src/worker/pages/DashboardPage.tsx (FINAL, CORRECTED)
import { Job } from '../types/workerTypes';
import { JobCard } from '../components/dashboard/JobCard';

interface DashboardPageProps {
  jobs: Job[];
  language: 'en' | 'hi';
  activeTab: 'new' | 'ongoing' | 'completed';
  onTabChange: (tab: 'new' | 'ongoing' | 'completed') => void;
  onSelectJob: (jobId: number) => void;
  onAcceptJob: (jobId: number) => void;
  onSwitchLanguage: () => void;
  onLogout: () => void;
  isLoading: boolean;
  totalEarnings: number; 
  hasActiveJob: boolean;
}

export const DashboardPage = ({ 
    jobs, 
    language, 
    activeTab, 
    onTabChange, 
    onSelectJob, 
    onAcceptJob, 
    onSwitchLanguage, 
    onLogout, 
    isLoading,
    
    // --- THIS IS THE FIX ---
    // The component now accepts the new prop.
    hasActiveJob,
    totalEarnings
}: DashboardPageProps) => {
  const tabs: Array<'new' | 'ongoing' | 'completed'> = ['new', 'ongoing', 'completed'];
  const tabNames = {
    en: { new: 'New Jobs', ongoing: 'Ongoing', completed: 'Completed' },
    hi: { new: 'नया काम', ongoing: 'चल रहा है', completed: 'पूरा हुआ' },
  };

  return (
    <div>
      <header className="bg-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800">InstaHands Worker</h1>
            </div>
            <div>
                <button onClick={onSwitchLanguage} className="text-sm font-semibold mr-4">{language === 'en' ? 'हिन्दी' : 'English'}</button>
                <button onClick={onLogout} className="text-sm font-semibold text-red-500">Logout</button>
            </div>
        </div>

        <div className="mt-4 p-4 bg-green-500 text-white rounded-lg text-center">
            <p className="text-sm font-medium uppercase tracking-wider">{language === 'en' ? 'Total Earnings' : 'कुल कमाई'}</p>
            <p className="text-3xl font-bold">₹{(totalEarnings || 0).toFixed(2)}</p>
        </div>

      </header>
      <main className="p-4 pb-20">
        <nav className="flex border-b border-gray-200 mb-4">
          {tabs.map(tab => (
            <button key={tab} onClick={() => onTabChange(tab)} className={`flex-1 py-3 text-center font-semibold border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
              {tabNames[language][tab]}
            </button>
          ))}
        </nav>
        <div>
          {isLoading ? <p className="text-center text-gray-500 mt-8">Loading jobs...</p> : jobs.length > 0 ? (
            jobs.map(job => 
                // --- THIS IS THE FIX ---
                // The 'hasActiveJob' prop is now passed down to each JobCard.
                <JobCard 
                    key={job.id} 
                    job={job} 
                    language={language} 
                    onSelect={onSelectJob} 
                    onAccept={onAcceptJob}
                    hasActiveJob={hasActiveJob}
                />
            )
          ) : (
            <p className="text-center text-gray-500 mt-8">No jobs in this category.</p>
          )}
        </div>
      </main>
    </div>
  );
};

