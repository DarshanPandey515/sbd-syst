import React from 'react';

const RecentActivity = ({ activities }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${activity.type === 'success'
                                    ? 'bg-green-500'
                                    : activity.type === 'user'
                                        ? 'bg-blue-500'
                                        : activity.type === 'activity'
                                            ? 'bg-yellow-500'
                                            : 'bg-gray-500'
                                }`}
                        ></div>
                        <div className="flex-1">
                            <p className="text-gray-900 font-medium">{activity.action}</p>
                            <p className="text-gray-500 text-sm">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(RecentActivity);