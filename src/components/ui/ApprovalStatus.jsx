import React from 'react';

const ApprovalStatus = ({ stats }) => {
    return (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Meet Approval Status</h3>
            <div className="space-y-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-3 h-3 rounded-full ${stat.color === 'green'
                                        ? 'bg-green-500'
                                        : stat.color === 'yellow'
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                            ></div>
                            <span className="text-gray-700 font-medium">{stat.label}</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <div className="flex-1 bg-green-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">75% Approved</span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ApprovalStatus);