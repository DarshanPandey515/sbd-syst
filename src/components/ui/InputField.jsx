import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = React.memo(({
    name,
    type = 'text',
    icon: Icon,
    placeholder,
    autoComplete,
    value,
    onChange,
    register,
    error,
    disabled,
    showPassword,
    togglePassword,
    className = '',
    label,
    required
}) => {
    const inputType = name === 'password' && showPassword ? 'text' : type;

    return (
        <div className={`${className} ${error ? 'text-red-500' : ''}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium mb-1 text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className={`w-5 h-5 ${error ? 'text-red-400' : 'text-gray-500'}`} />
                    </div>
                )}
                <input
                    type={inputType}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    {...register}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-12 py-3 bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-red-500 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : ''} ${disabled ? 'opacity-50' : ''}`}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                />
                {(name === 'password' && togglePassword) && (
                    <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={disabled}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    );
});

export default InputField;