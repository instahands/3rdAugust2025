// src/worker/pages/WorkerPendingPage.tsx

interface WorkerPendingPageProps {
    handleLogout: () => void;
}

export const WorkerPendingPage = ({ handleLogout }: WorkerPendingPageProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 text-center">
            <div className="w-full max-w-sm p-8 space-y-4 bg-white rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-gray-800">Application Submitted</h1>
                <p className="text-gray-600">Your profile has been submitted for verification. We will notify you once it has been reviewed by our team.</p>
                <p className="text-sm text-gray-500">Thank you for your patience.</p>
                <button 
                    onClick={handleLogout} 
                    className="w-full mt-4 py-2 px-4 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
