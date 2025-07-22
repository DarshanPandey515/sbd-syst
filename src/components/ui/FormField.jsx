// components/Form/FormField.jsx
import React from 'react';

const FormField = ({
    label,
    name,
    type = 'text',
    placeholder,
    register,
    error,
    disabled,
    options,
    icon: Icon,
    className = '',
    ...props
}) => {
    const renderInput = () => {
        if (type === 'select') {
            return (
                <select
                    {...register}
                    disabled={disabled}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50 ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (type === 'checkbox-group') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {options.map((option) => (
                        <div key={option.value} className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    id={`${name}-${option.value}`}
                                    value={option.value}
                                    {...register}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:opacity-50"
                                    disabled={disabled}
                                    {...props}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={`${name}-${option.value}`} className="font-medium text-gray-700">
                                    {option.label}
                                </label>
                                {option.description && (
                                    <p className="text-gray-500">{option.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="relative rounded-md shadow-sm">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
                <input
                    type={type}
                    {...register}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`${Icon ? 'pl-10' : 'pl-3'} mt-1 block w-full pr-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50 ${className}`}
                    {...props}
                />
            </div>
        );
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {renderInput()}
            {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        </div>
    );
};

export default FormField;