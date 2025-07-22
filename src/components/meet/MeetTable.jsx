import React from 'react';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import Table from '../ui/Table';

const MeetTable = ({ meets, loading, onSort, sortConfig, error }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            sortable: true,
            loadingWidth: '32'
        },
        {
            key: 'date',
            header: 'Date',
            sortable: true,
            loadingWidth: '24'
        },
        {
            key: 'venue',
            header: 'Venue',
            sortable: false,
            loadingWidth: '40'
        },
        {
            key: 'status',
            header: 'Status',
            sortable: false,
            loadingWidth: '16'
        },
        {
            key: 'actions',
            header: '',
            sortable: false
        }
    ];

    const rowRenderer = ({ item: meet }) => (
        <tr key={meet.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{meet.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{formatDate(meet.date)}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                    {meet.venue ? `${meet.venue.name}, ${meet.venue.city}` : 'Venue not specified'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap"> 
                <StatusBadge status={meet.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <Link
                    to={`/meets/meet-manage/${meet.id}/`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                    <Settings className="w-4 h-4" />
                    Manage
                </Link>
            </td>
        </tr>
    );

    return (
        <Table
            columns={columns}
            data={meets}
            loading={loading}
            error={error}
            onSort={onSort}
            sortConfig={sortConfig}
            emptyStateMessage="No meets found"
            rowRenderer={rowRenderer}
        />
    );
};

export default React.memo(MeetTable);