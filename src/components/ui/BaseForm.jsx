import React from 'react';
import { X } from 'lucide-react';

const BaseForm = ({
    title,
    description,
    isOpen,
    onClose,
    onSubmit,
    loading,
    error,
    children,
    submitButtonText = 'Submit',
    cancelButtonText = 'Cancel',
    maxWidth = 'max-w-4xl'
}) => {
    return (
        <div className={`overflow-hidden w-full ${maxWidth}`}>
            <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-center">
                            <X className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {children}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={loading}
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BaseForm;