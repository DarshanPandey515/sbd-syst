import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/toast/toast';
import { weightClassApi } from '../api/api';
import Sidebar from '../components/ui/Sidebar';
import TopBar from '../components/ui/TopBar';
import navItems from '../components/constants/navItems';
import SearchFilter from '../components/meet/SearchFilter';
import WeightClassTable from '../components/venueWeight/WeightClassTable';
import Pagination from '../components/meet/Pagination';
import WeightClassForm from '../components/venueWeight/WeightClassForm';

const WeightClass = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [weightClasses, setWeightClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleCreateWeightClass = () => {
        setIsFormOpen(true);
    };

    const fetchWeightClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await weightClassApi.getAll();
            setWeightClasses(response.data);
            setTotalPages(Math.ceil(response.data.length / 10));
        } catch (error) {
            console.error('Error fetching weight classes:', error);
            setError('Failed to load weight classes. Please try again.');
            showToast.error('Failed to load weight classes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeightClasses();
    }, []);

    const filteredAndSortedWeightClasses = useMemo(() => {
        let filtered = weightClasses.filter(wc => {
            const searchLower = searchTerm.toLowerCase();
            return (
                wc.name?.toLowerCase().includes(searchLower) ||
                (wc.min_weight?.toString().includes(searchLower)) ||
                wc.max_weight?.toString().includes(searchLower) ||
                (wc.gender === 'M' && 'male'.includes(searchLower)) ||
                (wc.gender === 'F' && 'female'.includes(searchLower)) ||
                (wc.gender === 'NB' && 'non-binary'.includes(searchLower))
            );
        });

        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'min_weight' || sortConfig.key === 'max_weight') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        const startIndex = (currentPage - 1) * 10;
        return filtered.slice(startIndex, startIndex + 10);
    }, [weightClasses, searchTerm, sortConfig, currentPage]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
            showToast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            showToast.error('Logout failed. Please try again.');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                navItems={navItems}
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
            />

            <div className="lg:ml-64">
                <TopBar toggleSidebar={toggleSidebar} title="Weight Class Management" subTitle="Your Weight Classes" />

                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <SearchFilter
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onCreateClick={handleCreateWeightClass}
                            pageText="weight class"
                        />

                        <WeightClassTable
                            weightClasses={filteredAndSortedWeightClasses}
                            loading={loading}
                            onSort={handleSort}
                            sortConfig={sortConfig}
                            error={error}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        <WeightClassForm
                            isOpen={isFormOpen}
                            onClose={() => setIsFormOpen(false)}
                            onWeightClassAdded={(newWeightClass) => {
                                setWeightClasses(prev => [newWeightClass, ...prev]);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WeightClass;