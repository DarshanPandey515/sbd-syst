import React from 'react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        approved: {
            text: 'Approved',
            className: 'bg-green-100 text-green-800 border-green-200'
        },
        pending: {
            text: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        },
        rejected: {
            text: 'Finished',
            className: 'bg-red-100 text-red-800 border-red-200'
        },
        live: {
            text: 'going on',
            className: 'bg-green-100 text-green-800 border-green-200'
        }
    };

    const config = statusConfig[status] || statusConfig.live;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
            {config.text}
        </span>
    );
};

export default React.memo(StatusBadge);