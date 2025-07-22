import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/toast/toast';
import {
    Home,
    Users,
    Calendar,
    Trophy,
    Clock,
    Building,
    UserCheck,
    X
} from 'lucide-react';

// Import components
import Sidebar from '../components/ui/Sidebar';
import TopBar from '../components/ui/TopBar';
import StatsCard from '../components/ui/StatsCard';
import ApprovalStatus from '../components/ui/ApprovalStatus';
import QuickActions from '../components/ui/QuickActions';
import RecentActivity from '../components/ui/RecentActivity';
import navItems from '../components/constants/navItems';



const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    const statsCards = [
        {
            title: 'Total Meets',
            value: '24',
            change: '+12%',
            icon: Calendar,
            color: 'red',
            trend: 'up'
        },
        {
            title: 'Total Participants',
            value: '156',
            change: '+8%',
            icon: Users,
            color: 'red',
            trend: 'up'
        },
        {
            title: 'Upcoming Meets',
            value: '5',
            change: '+2',
            icon: Clock,
            color: 'gray',
            trend: 'neutral'
        },
        {
            title: 'Total Lift Attempts',
            value: '2,847',
            change: '+15%',
            icon: Trophy,
            color: 'red',
            trend: 'up'
        }
    ];

    const approvalStats = [
        { label: 'Approved Meets', value: 18, color: 'green' },
        { label: 'Pending Approval', value: 4, color: 'yellow' },
        { label: 'Rejected', value: 2, color: 'red' }
    ];

    const recentActivities = [
        { action: 'New participant registered', time: '2 minutes ago', type: 'user' },
        { action: 'Meet "Spring Championship" approved', time: '1 hour ago', type: 'success' },
        { action: 'Lift attempt recorded', time: '3 hours ago', type: 'activity' },
        { action: 'New venue added', time: '1 day ago', type: 'info' }
    ];

    const handleLogout = async () => {
        try {
            await logout();
            showToast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            showToast.error('Logout failed. Please try again.');
        }
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
                <TopBar toggleSidebar={toggleSidebar} title="Dashboard" subTitle="Welcome back, Admin" />

                <main className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map((card) => (
                            <StatsCard key={card.title} {...card} />
                        ))}
                    </div>

                    {/* Approval Statistics and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <ApprovalStatus stats={approvalStats} />
                        <QuickActions />
                    </div>

                    {/* Recent Activity */}
                    <RecentActivity activities={recentActivities} />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;