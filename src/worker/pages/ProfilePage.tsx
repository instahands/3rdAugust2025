// src/worker/pages/ProfilePage.tsx (CORRECTED)

import { Profile } from '../../shared/types/types';

interface ProfilePageProps {
  workerProfile: Profile | null;
  onBack: () => void;
  onLogout: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="py-3 border-b border-gray-200">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || 'Not available'}</p>
  </div>
);

// This "export" keyword is the critical part that fixes the build error.
export const ProfilePage = ({ workerProfile, onBack, onLogout }: ProfilePageProps) => {
  if (!workerProfile) {
    return (
      <div>
        <header className="bg-white p-4 shadow-md sticky top-0 z-10 flex items-center">
          <button onClick={onBack} className="mr-4 text-gray-600">←</button>
          <h2 className="text-lg font-bold text-gray-800">My Profile</h2>
        </header>
        <p className="p-4 text-center">Loading profile...</p>
      </div>
    );
  }

  const joinDate = new Date(workerProfile.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <header className="bg-white p-4 shadow-md sticky top-0 z-10 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-600">←</button>
        <h2 className="text-lg font-bold text-gray-800">My Profile</h2>
      </header>
      <main className="p-4 space-y-6">
        <div className="p-6 bg-white rounded-lg shadow-sm text-center">
          <h3 className="text-2xl font-bold text-gray-800">{workerProfile.name}</h3>
          <span className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full ${
            workerProfile.worker_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            Status: {workerProfile.worker_status}
          </span>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h4 className="text-lg font-bold text-gray-700 mb-2">Personal Details</h4>
          <DetailRow label="Email" value={workerProfile.email} />
          <DetailRow label="Phone Number" value={workerProfile.phone} />
          <DetailRow label="Address" value={workerProfile.address} />
          <DetailRow label="Joined On" value={joinDate} />
        </div>
        
        <button 
          onClick={onLogout} 
          className="w-full py-3 text-white font-bold bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </main>
    </div>
  );
};