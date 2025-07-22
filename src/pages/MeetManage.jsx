import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    Plus,
    List,
    Activity,
    Download,
    Settings,
    Trophy,
    Award,
    BarChart2,
    ClipboardList,
    ArrowLeft,
    TrophyIcon
} from 'lucide-react';
import { showToast } from '../components/toast/toast';
import { meetApi } from '../api/api';
import ActionCard from '../components/ui/ActionCard';


const MeetManage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meet, setMeet] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isParticipantFormOpen, setIsParticipantFormOpen] = useState(false);

    const fetchMeetData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [meetResponse, participantsResponse] = await Promise.all([
                meetApi.getById(id),
                meetApi.getParticipants(id)
            ]);
            setMeet(meetResponse.data);
            setParticipants(participantsResponse.data);
        } catch (error) {
            console.error('Error fetching meet data:', error);
            setError('Failed to load meet details. Please try again.');
            showToast.error('Failed to load meet details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetData();
    }, [id]);

    const handleStartManagement = () => {
        showToast.success('Game management started!');
    };

    const handleExportData = () => {
        showToast.loading('Preparing data export...');
        setTimeout(() => {
            showToast.success('Data exported successfully!');
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!meet) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">No meet found.</div>
            </div>
        );
    }

    const participantCount = participants.length || 0;
    const weightClasses = meet.weight_classes.map(wc => ({
        name: wc.name,
        id: wc.id,
        count: participants.filter(p => p.weight_class?.id === wc.id).length || 0
    }));

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 lg:px-8">
            {/* 🔼 Top Meet Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="mb-8">
                    <Link
                        to="/meets"
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to meets
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{meet.name}</h1>
                                <p className="text-gray-600 text-sm">
                                    {new Date(meet.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}{' '}
                                    • {meet.venue.name}, {meet.venue.city}
                                </p>
                            </div>

                            <Link
                                to={`/meets/meet-manage/${meet.id}/participants`}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm bg-red-600 text-white hover:bg-red-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Participant
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            {/* ⚡ Action Cards */}
            <div className="max-w-7xl mx-auto mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                    icon={<List className="h-6 w-6 text-red-600" />}
                    title="View Participants"
                    description="Manage all participants and registrations"
                    link={`/meets/meet-manage/${meet.id}/participants`}
                    buttonText="View List"
                    color="red"
                />
                <ActionCard
                    icon={<Activity className="h-6 w-6 text-red-600" />}
                    title="Start Game Management"
                    description="Begin live session for the meet"
                    onClick={handleStartManagement}
                    link={`/meets/meet-manage/${meet.id}/game`}
                    buttonText="Start Session"
                    color="red"
                />
                <ActionCard
                    icon={<TrophyIcon className="h-6 w-6 text-red-600" />}
                    title="Meet Results"
                    description="View official rankings and attempt history"
                    link={`/meets/meet-manage/${meet.id}/results`}
                    buttonText="View Results"
                    color="red"
                />
            </div>

            {/* 📊 Stats + 🏋️‍♀️ Weight Classes */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Meet Stats */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meet Stats</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <StatCard icon={<Users className="h-6 w-6 text-gray-400" />} value={participantCount} label="Total Participants" />
                        <StatCard icon={<Trophy className="h-6 w-6 text-gray-400" />} value={meet.weight_classes.length} label="Weight Classes" />
                        <StatCard icon={<Award className="h-6 w-6 text-gray-400" />} value="3" label="Events (SBD)" />
                        <StatCard icon={<BarChart2 className="h-6 w-6 text-gray-400" />} value={participants.reduce((sum, p) => sum + (p.attempts?.length || 0), 0)} label="Total Attempts" />
                    </div>
                </div>

                {/* Weight Classes */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Weight Classes</h3>
                        <Link to="/weight-classes" className="text-sm font-medium text-red-600 hover:text-red-500">Manage All</Link>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {weightClasses.map((wc) => (
                            <div key={wc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <h4 className="text-base font-medium text-gray-900">{wc.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{wc.count} {wc.count === 1 ? 'participant' : 'participants'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



        </div>
    );

};

const StatCard = ({ icon, value, label }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    </div>
);


export default MeetManage;