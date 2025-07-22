import React from 'react';

const QuickActions = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium">
                    Create New Meet
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-200 font-medium">
                    Add Participant
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors duration-200 font-medium">
                    View Reports
                </button>
            </div>
        </div>
    );
};

export default React.memo(QuickActions);