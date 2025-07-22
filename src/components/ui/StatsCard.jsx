import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ title, value, change, icon: Icon, color, trend }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color === 'red' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${color === 'red' ? 'text-red-600' : 'text-gray-600'}`} />
                </div>
                {trend === 'up' && (
                    <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{change}</span>
                    </div>
                )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
};

export default React.memo(StatsCard);