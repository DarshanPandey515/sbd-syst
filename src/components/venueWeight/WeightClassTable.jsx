import React from 'react';
import Table from '../ui/Table';

const WeightClassTable = ({ weightClasses, loading, onSort, sortConfig, error }) => {
    const columns = [
        {
            key: 'name',
            header: 'Name',
            sortable: true,
            loadingWidth: '32'
        },
        {
            key: 'min_weight',
            header: 'Min Weight',
            sortable: true,
            loadingWidth: '24'
        },
        {
            key: 'max_weight',
            header: 'Max Weight',
            sortable: false,
            loadingWidth: '24'
        },
        {
            key: 'gender',
            header: 'Gender',
            sortable: false,
            loadingWidth: '16'
        }
    ];

    const rowRenderer = ({ item: wc }) => (
        <tr key={wc.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{wc.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{wc.min_weight || 'N/A'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{wc.max_weight}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                    {wc.gender === 'M' ? 'Male' : wc.gender === 'F' ? 'Female' : 'Non-Binary'}
                </div>
            </td>
        </tr>
    );

    return (
        <Table
            columns={columns}
            data={weightClasses}
            loading={loading}
            error={error}
            onSort={onSort}
            sortConfig={sortConfig}
            emptyStateMessage="No weight classes found"
            rowRenderer={rowRenderer}
        />
    );
};

export default React.memo(WeightClassTable);