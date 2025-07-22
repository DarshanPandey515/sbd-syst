import React from 'react';
import { Menu } from 'lucide-react';

const TopBar = ({ toggleSidebar, title, subTitle }) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <Menu className="w-6 h-6" />    
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                        <p className="text-gray-600">{subTitle}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700">2/5 Remaining's</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default React.memo(TopBar);