import React from 'react';
import { Trophy, LogOut, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ navItems, isOpen, toggleSidebar, handleLogout }) => {
    const location = useLocation();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-black transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">PowerMeet</h1>
                            <p className="text-xs text-gray-400">Admin Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-4">
                    <div className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center space-x-3 px-3 py-2  font-medium rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon
                                        className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400'
                                            }`}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-6 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 group cursor-pointer"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default React.memo(Sidebar);