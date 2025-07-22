import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/toast/toast';
import { meetApi } from '../api/api';
import Sidebar from '../components/ui/Sidebar';
import TopBar from '../components/ui/TopBar';
import navItems from '../components/constants/navItems';
import SearchFilter from '../components/meet/SearchFilter';
import MeetTable from '../components/meet/MeetTable';
import Pagination from '../components/meet/Pagination';
import MeetForm from '../components/meet/MeetForm';

const Meet = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [meets, setMeets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);


    const { logout } = useAuth();
    const navigate = useNavigate();


    const handleCreateMeet = () => {
        setIsFormOpen(true);
    };

    // Fetch meets from API
    const fetchMeets = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetApi.getAll();
            setMeets(response.data);
            // Calculate total pages based on response (if pagination is implemented)
            setTotalPages(Math.ceil(response.data.length / 10)); // Assuming 10 items per page
        } catch (error) {
            console.error('Error fetching meets:', error);
            setError('Failed to load meets. Please try again.');
            showToast.error('Failed to load meets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeets();
    }, []);

    const filteredAndSortedMeets = useMemo(() => {
        let filtered = meets.filter(meet => {
            const searchLower = searchTerm.toLowerCase();

            const nameMatch = meet.name?.toLowerCase().includes(searchLower) ?? false;

            const venueMatch = meet.venue?.name?.toLowerCase().includes(searchLower) ||
                meet.venue?.city?.toLowerCase().includes(searchLower) || false;

            return nameMatch || venueMatch;
        });

        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        const startIndex = (currentPage - 1) * 10;
        return filtered.slice(startIndex, startIndex + 10);
    }, [meets, searchTerm, sortConfig, currentPage]);


    // Handle sorting
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Handle sidebar toggle
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            showToast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            showToast.error('Logout failed. Please try again.');
        }
    };

    // Handle pagination
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
                <TopBar toggleSidebar={toggleSidebar} title="Meet Management" subTitle="Your Meets" />

                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <SearchFilter
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onCreateClick={handleCreateMeet}
                            pageText="meet"
                        />

                        <MeetTable
                            meets={filteredAndSortedMeets}
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
                        <MeetForm
                            isOpen={isFormOpen}
                            onClose={() => setIsFormOpen(false)}
                            onMeetAdded={(newMeet) => {
                                setMeets(prev => [newMeet, ...prev]);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Meet;