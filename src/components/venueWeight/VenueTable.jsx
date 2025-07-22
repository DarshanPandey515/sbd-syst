import React from 'react';
import Table from '../ui/Table';

const VenueTable = ({ venues, loading, onSort, sortConfig, error }) => {
    const columns = [
        {
            key: 'name',
            header: 'Name',
            sortable: true,
            loadingWidth: '32'
        },
        {
            key: 'city',
            header: 'City',
            sortable: true,
            loadingWidth: '24'
        },
        {
            key: 'country',
            header: 'Country',
            sortable: false,
            loadingWidth: '24'
        },
        {
            key: 'address',
            header: 'Address',
            sortable: false,
            loadingWidth: '40'
        }
    ];

    const rowRenderer = ({ item: venue }) => (
        <tr key={venue.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{venue.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{venue.city}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{venue.country}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{venue.address}</div>
            </td>
        </tr>
    );

    return (
        <Table
            columns={columns}
            data={venues}
            loading={loading}
            error={error}
            onSort={onSort}
            sortConfig={sortConfig}
            emptyStateMessage="No venues found"
            rowRenderer={rowRenderer}
        />
    );
};

export default React.memo(VenueTable);