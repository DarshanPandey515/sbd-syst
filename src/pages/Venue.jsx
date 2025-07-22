import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/toast/toast';
import { venueApi } from '../api/api';
import Sidebar from '../components/ui/Sidebar';
import TopBar from '../components/ui/TopBar';
import navItems from '../components/constants/navItems';
import SearchFilter from '../components/meet/SearchFilter';
import VenueTable from '../components/venueWeight/VenueTable';
import Pagination from '../components/meet/Pagination';
import VenueForm from '../components/venueWeight/VenueForm';

const Venue = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleCreateVenue = () => {
        setIsFormOpen(true);
    };

    const fetchVenues = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await venueApi.getAll();
            setVenues(response.data);
            setTotalPages(Math.ceil(response.data.length / 10));
        } catch (error) {
            console.error('Error fetching venues:', error);
            setError('Failed to load venues. Please try again.');
            showToast.error('Failed to load venues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const filteredAndSortedVenues = useMemo(() => {
        let filtered = venues.filter(venue => {
            const searchLower = searchTerm.toLowerCase();
            return (
                venue.name?.toLowerCase().includes(searchLower) ||
                venue.city?.toLowerCase().includes(searchLower) ||
                venue.country?.toLowerCase().includes(searchLower) ||
                venue.address?.toLowerCase().includes(searchLower)
            );
        });

        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        const startIndex = (currentPage - 1) * 10;
        return filtered.slice(startIndex, startIndex + 10);
    }, [venues, searchTerm, sortConfig, currentPage]);

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
                <TopBar toggleSidebar={toggleSidebar} title="Venue Management" subTitle="Your Venues" />

                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <SearchFilter
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onCreateClick={handleCreateVenue}
                            pageText="venue"
                        />

                        <VenueTable
                            venues={filteredAndSortedVenues}
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
                        <VenueForm
                            isOpen={isFormOpen}
                            onClose={() => setIsFormOpen(false)}
                            onVenueAdded={(newVenue) => {
                                setVenues(prev => [newVenue, ...prev]);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Venue;