import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { liftApi, participantApi, meetApi, weightClassApi } from '../api/api';
import { showToast } from '../components/toast/toast';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft, Users, Dumbbell, User, Weight, Search, CheckCircle, XCircle, Info,
    ChevronRight, Filter, Award, BarChart2, Hash, Scale, Calendar, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ActionCard from '../components/ui/ActionCard';
import MeetHeader from '../components/ui/MeetHeader';


const Game = () => {
    const { id: meetId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWeightClass, setSelectedWeightClass] = useState('all');
    const [selectedLifter, setSelectedLifter] = useState(null);
    const [currentLift, setCurrentLift] = useState('squat');
    const [currentAttempt, setCurrentAttempt] = useState(1);
    const [customWeight, setCustomWeight] = useState('');
    const [meetData, setMeetData] = useState(null);
    const [weightClasses, setWeightClasses] = useState([]);
    const [participants, setParticipants] = useState([]);

    // Data fetching logic remains the same as original
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const meetResponse = await meetApi.getById(meetId, {
                    params: { expand: 'participants,participants.attempts' }
                });

                if (!meetResponse.data) throw new Error('Meet not found');
                if (meetResponse.data.organizer.id !== user.id && !user.is_staff) {
                    throw new Error('Unauthorized access');
                }

                setMeetData(meetResponse.data);

                const meetWeightClasses = meetResponse.data.weight_classes || [];
                setWeightClasses([
                    { id: 'all', name: 'All Weight Classes' },
                    ...meetWeightClasses.map(wc => ({
                        id: wc.id,
                        name: wc.name,
                        gender: wc.gender
                    }))
                ]);

                const participantsWithAttempts = meetResponse.data.participants.map(p => {
                    const attempts = {
                        squat: Array(3).fill(null),
                        bench: Array(3).fill(null),
                        deadlift: Array(3).fill(null)
                    };

                    if (p.attempts) {
                        p.attempts.forEach(a => {
                            const index = a.round_number - 1;
                            if (a.lift_type === 'SQ') attempts.squat[index] = { ...a };
                            if (a.lift_type === 'BP') attempts.bench[index] = { ...a };
                            if (a.lift_type === 'DL') attempts.deadlift[index] = { ...a };
                        });
                    }

                    return {
                        ...p,
                        weight_class_id: p.weight_class?.id.toString() || 'all',
                        attempts,
                        currentWeight: getCurrentWeight(p, attempts)
                    };
                });

                setParticipants(participantsWithAttempts);
            } catch (error) {
                showToast.error(error.message || 'Failed to load meet data');
                navigate('/meets');
            } finally {
                setIsLoading(false);
            }
        };

        if (user && meetId) fetchData();
    }, [meetId, user, navigate]);

    const getCurrentWeight = (participant, attempts) => {
        const successfulAttempts = [
            ...attempts.squat.filter(a => a?.success),
            ...attempts.bench.filter(a => a?.success),
            ...attempts.deadlift.filter(a => a?.success)
        ];

        if (successfulAttempts.length > 0) {
            const maxWeight = Math.max(...successfulAttempts.map(a => parseFloat(a.weight)));
            return maxWeight;
        }

        const allAttempts = [
            ...attempts.squat.filter(a => a),
            ...attempts.bench.filter(a => a),
            ...attempts.deadlift.filter(a => a)
        ];

        if (allAttempts.length > 0) {
            const maxWeight = Math.max(...allAttempts.map(a => parseFloat(a.weight)));
            return maxWeight;
        }

        return participant.body_weight;
    };

    const filteredParticipants = participants.filter(participant => {
        const matchesSearch = participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (participant.team && participant.team.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesWeightClass = selectedWeightClass === 'all' ||
            participant.weight_class?.id.toString() === selectedWeightClass;
        return matchesSearch && matchesWeightClass;
    });

    const recordLift = async (status) => {
        if (!selectedLifter) return;

        const liftTypeMap = {
            squat: 'SQ',
            bench: 'BP',
            deadlift: 'DL'
        };

        try {
            const weight = customWeight || selectedLifter.currentWeight || selectedLifter.body_weight;
            const attemptData = {
                participant_id: selectedLifter.id,
                lift_type: liftTypeMap[currentLift],
                weight: weight,
                success: status === 'good',
                round_number: currentAttempt
            };

            const existingAttempt = selectedLifter.attempts[currentLift][currentAttempt - 1];
            let response;

            if (existingAttempt?.id) {
                response = await liftApi.update(existingAttempt.id, attemptData);
            } else {
                response = await liftApi.create(attemptData);
            }

            setParticipants(prevParticipants =>
                prevParticipants.map(p => {
                    if (p.id === selectedLifter.id) {
                        const updatedAttempts = {
                            ...p.attempts,
                            [currentLift]: [
                                ...p.attempts[currentLift].slice(0, currentAttempt - 1),
                                response.data,
                                ...p.attempts[currentLift].slice(currentAttempt)
                            ]
                        };

                        return {
                            ...p,
                            attempts: updatedAttempts,
                            currentWeight: getCurrentWeight(p, updatedAttempts)
                        };
                    }
                    return p;
                })
            );

            setSelectedLifter(prev => ({
                ...prev,
                attempts: {
                    ...prev.attempts,
                    [currentLift]: [
                        ...prev.attempts[currentLift].slice(0, currentAttempt - 1),
                        response.data,
                        ...prev.attempts[currentLift].slice(currentAttempt)
                    ]
                },
                currentWeight: getCurrentWeight(prev, {
                    ...prev.attempts,
                    [currentLift]: [
                        ...prev.attempts[currentLift].slice(0, currentAttempt - 1),
                        response.data,
                        ...prev.attempts[currentLift].slice(currentAttempt)
                    ]
                })
            }));

            setCustomWeight('');
            showToast.success('Lift recorded successfully');
        } catch (error) {
            console.error('Error recording lift:', error);
            showToast.error(error.response?.data?.message || 'Failed to record lift');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
                    <p className="text-lg font-medium text-gray-700">Loading meet data...</p>
                </div>
            </div>
        );
    }

    if (!meetData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md p-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <Info className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Meet not found</h3>
                    <p className="text-gray-500">The meet you're looking for doesn't exist or you don't have access.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <header className="sticky top-0 z-40 px-6 py-4">
                <MeetHeader
                    meetData={meetData}
                    backLink={`/meets/meet-manage/${meetData.id}`}
                />
            </header>

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Stats Cards */}
                <section className="px-6 py-4">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Lifters</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{participants.length}</p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-xs mt-3 text-gray-500 flex items-center">
                                <Award className="h-3 w-3 mr-1" />
                                {weightClasses.length - 1} weight classes
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Flight</p>
                                    <p className="text-xl font-bold text-gray-900 mt-1 truncate">
                                        {selectedWeightClass === 'all' ? 'All Classes' :
                                            weightClasses.find(wc => wc.id === selectedWeightClass)?.name || '--'}
                                    </p>
                                    <p className="text-sm text-red-600 font-medium capitalize mt-1">
                                        {currentLift}
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Dumbbell className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-xs mt-3 text-gray-500 flex items-center">
                                <BarChart2 className="h-3 w-3 mr-1" />
                                {filteredParticipants.length} lifters in flight
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Lifter</p>
                                    <p className="text-xl font-bold text-gray-900 mt-1 truncate">
                                        {selectedLifter?.name || '--'}
                                    </p>
                                    <p className="text-sm text-gray-600 capitalize mt-1">
                                        {selectedLifter?.status?.replace('-', ' ') || '--'}
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                    <User className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-xs mt-3 text-gray-500 flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                Lot #{selectedLifter?.lot || '--'}
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Weight</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {selectedLifter?.currentWeight || selectedLifter?.body_weight || '--'}
                                        <span className="text-lg text-gray-500 ml-1">KG</span>
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                    <Weight className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-xs mt-3 text-gray-500 flex items-center">
                                <Scale className="h-3 w-3 mr-1" />
                                {selectedLifter ? `BW: ${selectedLifter.body_weight}kg` : '--'}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="flex-1 flex overflow-hidden">
                    {/* Participants Sidebar */}
                    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Participants</h2>
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search lifters..."
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Filter className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        className="block w-full pl-10 pr-3 py-2.5 text-sm border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                                        value={selectedWeightClass}
                                        onChange={(e) => setSelectedWeightClass(e.target.value)}
                                    >
                                        {weightClasses.map(wc => (
                                            <option key={wc.id} value={wc.id}>{wc.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredParticipants.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {filteredParticipants.map(participant => (
                                        <li
                                            key={participant.id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedLifter?.id === participant.id ? 'bg-red-50' : ''}`}
                                            onClick={() => setSelectedLifter(participant)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 min-w-0">
                                                    <div className={`h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-medium ${participant.status === 'next' ? 'bg-red-600' :
                                                        participant.status === 'on-deck' ? 'bg-yellow-500' :
                                                            'bg-gray-500'
                                                        }`}>
                                                        {participant.lot}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{participant.name}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-xs text-gray-500 truncate">
                                                                {participant.team?.name || 'No team'}
                                                            </span>
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                                                {participant.weight_class?.name || '--'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-2">
                                                    <p className="text-sm font-semibold text-gray-900">{participant.body_weight}kg</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${participant.status === 'next' ? 'bg-red-100 text-red-800' :
                                                        participant.status === 'on-deck' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {participant.status?.replace('-', ' ') || '--'}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-400">No lifters found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                        <div className="flex-1 p-6 overflow-y-auto">
                            {selectedLifter ? (
                                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Lifter Header */}
                                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="min-w-0">
                                                <h2 className="text-2xl font-bold text-gray-900">{selectedLifter.name}</h2>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                                    <span className="text-sm text-gray-600 flex items-center">
                                                        <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                                                        {selectedLifter.team?.name || 'No team'}
                                                    </span>
                                                    <span className="text-sm text-gray-600 flex items-center">
                                                        <Scale className="h-4 w-4 mr-1.5 text-gray-400" />
                                                        {selectedLifter.weight_class?.name || 'No weight class'} • {selectedLifter.body_weight}kg
                                                    </span>
                                                    <span className="text-sm text-gray-600 flex items-center">
                                                        <Hash className="h-4 w-4 mr-1.5 text-gray-400" />
                                                        Lot #{selectedLifter.lot || '--'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-gray-900">
                                                    {selectedLifter.currentWeight || selectedLifter.body_weight}
                                                    <span className="text-lg text-gray-500 ml-1">KG</span>
                                                </p>
                                                <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${selectedLifter.status === 'next' ? 'bg-red-100 text-red-800' :
                                                    selectedLifter.status === 'on-deck' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {selectedLifter.status?.replace('-', ' ') || '--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lift Attempts */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                                            {['squat', 'bench', 'deadlift'].map(lift => (
                                                <div
                                                    key={lift}
                                                    className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${currentLift === lift ? 'border-red-300 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                                                    onClick={() => setCurrentLift(lift)}
                                                >
                                                    <div className={`px-4 py-3 ${currentLift === lift ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                                        <h3 className={`text-sm font-semibold ${currentLift === lift ? '' : ''}`}>
                                                            {lift.charAt(0).toUpperCase() + lift.slice(1)}
                                                        </h3>
                                                    </div>
                                                    <div className="divide-y divide-gray-200">
                                                        {[1, 2, 3].map(attempt => (
                                                            <div
                                                                key={attempt}
                                                                className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${currentLift === lift && currentAttempt === attempt ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCurrentAttempt(attempt);
                                                                }}
                                                            >
                                                                <span className="text-sm text-gray-700">Attempt {attempt}</span>
                                                                <span className={`text-sm font-medium ${!selectedLifter.attempts[lift][attempt - 1] ? 'text-gray-400' :
                                                                    selectedLifter.attempts[lift][attempt - 1]?.success ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                    {!selectedLifter.attempts[lift][attempt - 1] ? '--' :
                                                                        selectedLifter.attempts[lift][attempt - 1]?.success ?
                                                                            `${selectedLifter.attempts[lift][attempt - 1]?.weight}kg` : 'Failed'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Record Attempt */}
                                        <div className="border-t border-gray-200 pt-6">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                                                <h3 className="text-lg font-bold text-gray-900">Record Attempt</h3>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm text-gray-600">Currently viewing:</span>
                                                    <span className="text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full flex items-center">
                                                        <span className="capitalize">{currentLift}</span>
                                                        <span className="mx-1">•</span>
                                                        <span>Attempt {currentAttempt}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Custom Weight (kg)
                                                    </label>
                                                    <div className="relative rounded-md shadow-sm">
                                                        <input
                                                            type="number"
                                                            value={customWeight}
                                                            onChange={(e) => setCustomWeight(e.target.value)}
                                                            placeholder={`Default: ${selectedLifter.body_weight}kg`}
                                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">kg</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => recordLift('good')}
                                                        className="group relative flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-sm"
                                                    >
                                                        <CheckCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                                        Good Lift
                                                    </button>
                                                    <button
                                                        onClick={() => recordLift('no')}
                                                        className="group relative flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-sm"
                                                    >
                                                        <XCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                                        No Lift
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                                        <Info className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No lifter selected</h3>
                                    <p className="text-gray-500 mt-2">Select a lifter from the list to record an attempt</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Game;