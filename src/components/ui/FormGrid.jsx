import React from 'react';

const FormGrid = ({ children, cols = 2, className = '', ...props }) => {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
    };

    return (
        <div
            className={`grid gap-6 ${gridClasses[cols]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default FormGrid;