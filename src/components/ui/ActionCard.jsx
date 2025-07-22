import React from 'react';
import { Link } from 'react-router-dom';

const ActionCard = ({
    icon,
    title,
    description,
    link,
    onClick,
    buttonText,
    color = 'gray',
    className = ''
}) => {
    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        gray: 'bg-gray-900 hover:bg-gray-800'
    };

    const content = (
        <div className={`flex flex-col justify-between h-full bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-6 group ${className}`}>
            <div className="flex flex-col items-start gap-4">
                <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-200 ${color === 'red' ? 'bg-red-100 text-red-600' :
                        color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            color === 'green' ? 'bg-green-100 text-green-600' :
                                'bg-gray-100 text-gray-600'
                    }`}>
                    {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="mt-6">
                <button
                    onClick={onClick}
                    className={`inline-flex items-center text-sm font-medium rounded-lg px-4 py-2 transition-colors duration-200 text-white ${colorClasses[color]}`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );

    return link ? (
        <Link to={link} className="block h-full">
            {content}
        </Link>
    ) : (
        <div className="h-full cursor-pointer" onClick={onClick}>
            {content}
        </div>
    );
};

export default ActionCard;