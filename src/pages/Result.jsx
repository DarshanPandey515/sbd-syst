import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Award, Medal, BarChart2, ArrowLeft, Scale, Venus, Mars, Download } from 'lucide-react';
import { meetApi } from '../api/api';
import { showToast } from '../components/toast/toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResultPDF from './ResultPDF';
import MeetHeader from '../components/ui/MeetHeader';


// IPF GL formula parameters
const PARAMETERS = {
    "M": {
        "Raw": {
            "SBD": [1199.72839, 1025.18162, 0.009210],
            "B": [320.98041, 281.40258, 0.01008]
        },
        "Single-ply": {
            "SBD": [1236.25115, 1449.21864, 0.01644],
            "B": [381.22073, 733.79378, 0.02398]
        }
    },
    "F": {
        "Raw": {
            "SBD": [610.32796, 1045.59282, 0.03048],
            "B": [142.40398, 442.52671, 0.04724]
        },
        "Single-ply": {
            "SBD": [758.63878, 949.31382, 0.02435],
            "B": [221.82209, 357.00377, 0.02937]
        }
    }
};

// Function to calculate GI points using IPF GL formula
const calculateGLPoints = (sex, equipment, event, total, bodyweight) => {
    if (bodyweight < 35) return 0.0;

    const [a, b, c] = PARAMETERS[sex][equipment][event];
    const denom = a - (b * Math.exp(-1.0 * c * bodyweight));

    if (denom === 0) return 0.0;

    return Math.max(0.0, total * 100.0 / denom);
};

const Result = () => {
    const { id } = useParams();
    const [meet, setMeet] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overall');

    // Process participant data with scores and highest lifts
    const processParticipantData = (participant) => {
        if (!participant.attempts || participant.attempts.length === 0) {
            return {
                ...participant,
                giScore: 0,
                highestSquat: { weight: 0, attempt: null },
                highestBench: { weight: 0, attempt: null },
                highestDeadlift: { weight: 0, attempt: null },
                totalLifted: 0
            };
        }

        // Find highest successful attempts for each lift type
        const squats = participant.attempts.filter(a => a.lift_type === 'SQ');
        const benches = participant.attempts.filter(a => a.lift_type === 'BP');
        const deadlifts = participant.attempts.filter(a => a.lift_type === 'DL');

        const highestSquat = squats.reduce((max, attempt) => {
            const weight = parseFloat(attempt.weight) || 0;
            return attempt.success && weight > max.weight ?
                { weight, attempt: attempt.round_number } : max;
        }, { weight: 0, attempt: null });

        const highestBench = benches.reduce((max, attempt) => {
            const weight = parseFloat(attempt.weight) || 0;
            return attempt.success && weight > max.weight ?
                { weight, attempt: attempt.round_number } : max;
        }, { weight: 0, attempt: null });

        const highestDeadlift = deadlifts.reduce((max, attempt) => {
            const weight = parseFloat(attempt.weight) || 0;
            return attempt.success && weight > max.weight ?
                { weight, attempt: attempt.round_number } : max;
        }, { weight: 0, attempt: null });

        const totalLifted = parseFloat((highestSquat.weight + highestBench.weight + highestDeadlift.weight).toFixed(2));
        const bodyWeight = parseFloat(participant.body_weight) || 0;

        // Calculate GI score using IPF GL formula
        const giScore = calculateGLPoints(
            participant.gender === 'M' ? 'M' : 'F',
            'Raw', // Assuming raw equipment - adjust if needed
            'SBD', // Full powerlifting event
            totalLifted,
            bodyWeight
        );

        return {
            ...participant,
            giScore: parseFloat(giScore.toFixed(2)),
            highestSquat,
            highestBench,
            highestDeadlift,
            totalLifted
        };
    };

    const fetchMeetData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [meetResponse, participantsResponse] = await Promise.all([
                meetApi.getById(id),
                meetApi.getParticipants(id)
            ]);

            setMeet(meetResponse.data);

            // Process all participants with scores and highest lifts
            const processedParticipants = participantsResponse.data
                .map(processParticipantData)
                .sort((a, b) => b.giScore - a.giScore);

            setParticipants(processedParticipants);
        } catch (error) {
            console.error('Error fetching meet data:', error);
            setError('Failed to load meet results. Please try again.');
            showToast.error('Failed to load meet results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetData();
    }, [id]);

    // Group participants by weight class
    const participantsByWeightClass = participants.reduce((acc, participant) => {
        const weightClass = participant.weight_class?.name || 'Unknown';
        if (!acc[weightClass]) {
            acc[weightClass] = [];
        }
        acc[weightClass].push(participant);
        return acc;
    }, {});

    // Group participants by gender
    const participantsByGender = participants.reduce((acc, participant) => {
        const gender = participant.gender === 'M' ? 'Male' : 'Female';
        if (!acc[gender]) {
            acc[gender] = [];
        }
        acc[gender].push(participant);
        return acc;
    }, {});

    const renderPodium = (topParticipants) => {
        if (topParticipants.length < 3) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 2nd Place */}
                <div className="md:order-1 h-full">
                    <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl shadow-lg p-6 h-full flex flex-col">
                        <div className="flex items-center mb-4">
                            <Award className="h-6 w-6 text-gray-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-700">2nd Place</h3>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{topParticipants[1].name}</div>
                        <div className="text-sm text-gray-600 mb-3">
                            {topParticipants[1].team?.name || 'No team'} • {topParticipants[1].body_weight}kg
                        </div>
                        <div className="mt-auto space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total:</span>
                                <span className="font-medium">{topParticipants[1].totalLifted.toFixed(2)}kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">GI Score:</span>
                                <span className="font-medium">{topParticipants[1].giScore.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="md:order-2 h-full">
                    <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-xl shadow-xl p-6 h-full flex flex-col transform md:-translate-y-4">
                        <div className="flex items-center mb-4">
                            <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
                            <h3 className="text-lg font-semibold text-yellow-800">1st Place</h3>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{topParticipants[0].name}</div>
                        <div className="text-sm text-gray-600 mb-3">
                            {topParticipants[0].team?.name || 'No team'} • {topParticipants[0].body_weight}kg
                        </div>
                        <div className="mt-auto space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total:</span>
                                <span className="font-medium">{topParticipants[0].totalLifted.toFixed(2)}kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">GI Score:</span>
                                <span className="font-medium">{topParticipants[0].giScore.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="md:order-3 h-full">
                    <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-xl shadow-lg p-6 h-full flex flex-col">
                        <div className="flex items-center mb-4">
                            <Medal className="h-6 w-6 text-amber-600 mr-2" />
                            <h3 className="text-lg font-semibold text-amber-800">3rd Place</h3>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{topParticipants[2].name}</div>
                        <div className="text-sm text-gray-600 mb-3">
                            {topParticipants[2].team?.name || 'No team'} • {topParticipants[2].body_weight}kg
                        </div>
                        <div className="mt-auto space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total:</span>
                                <span className="font-medium">{topParticipants[2].totalLifted.toFixed(2)}kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">GI Score:</span>
                                <span className="font-medium">{topParticipants[2].giScore.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderResultsTable = (data) => {
        return (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Squat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bench</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadlift</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GI Score</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((participant, index) => {
                                const rank = index + 1;
                                let rowClass = "";
                                let rankClass = "text-gray-500";

                                if (rank === 1) {
                                    rowClass = "bg-yellow-50";
                                    rankClass = "text-yellow-600";
                                } else if (rank === 2) {
                                    rowClass = "bg-gray-50";
                                    rankClass = "text-gray-600";
                                } else if (rank === 3) {
                                    rowClass = "bg-amber-50";
                                    rankClass = "text-amber-600";
                                }

                                return (
                                    <tr key={`${participant.id}-${index}`} className={rowClass}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-medium ${rankClass}`}>
                                                {rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{participant.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {participant.gender === 'M' ? 'Male' : 'Female'} • {participant.body_weight}kg
                                                {participant.weight_class && ` • ${participant.weight_class.name}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {participant.highestSquat.weight > 0 ? (
                                                <div className="flex items-center">
                                                    <span className="font-medium">
                                                        {participant.highestSquat.weight.toFixed(2)}kg
                                                    </span>
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        (R{participant.highestSquat.attempt})
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {participant.highestBench.weight > 0 ? (
                                                <div className="flex items-center">
                                                    <span className="font-medium">
                                                        {participant.highestBench.weight.toFixed(2)}kg
                                                    </span>
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        (R{participant.highestBench.attempt})
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {participant.highestDeadlift.weight > 0 ? (
                                                <div className="flex items-center">
                                                    <span className="font-medium">
                                                        {participant.highestDeadlift.weight.toFixed(2)}kg
                                                    </span>
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        (R{participant.highestDeadlift.attempt})
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                            {participant.totalLifted > 0 ? `${participant.totalLifted.toFixed(2)}kg` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                            {participant.giScore.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overall':
                return (
                    <>
                        {renderPodium(participants.slice(0, 3))}
                        {renderResultsTable(participants)}
                    </>
                );
            case 'weightclass':
                return Object.entries(participantsByWeightClass).map(([weightClass, classParticipants]) => (
                    <div key={weightClass} className="mb-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Scale className="h-5 w-5 text-gray-600 mr-2" />
                            {weightClass} Weight Class
                        </h3>
                        {renderPodium(classParticipants.slice(0, 3))}
                        {renderResultsTable(classParticipants.sort((a, b) => b.giScore - a.giScore))}
                    </div>
                ));
            case 'gender':
                return Object.entries(participantsByGender).map(([gender, genderParticipants]) => (
                    <div key={gender} className="mb-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            {gender === 'Male' ? (
                                <Mars className="h-5 w-5 text-blue-600 mr-2" />
                            ) : (
                                <Venus className="h-5 w-5 text-pink-600 mr-2" />
                            )}
                            {gender} Division
                        </h3>
                        {renderPodium(genderParticipants.slice(0, 3))}
                        {renderResultsTable(genderParticipants.sort((a, b) => b.giScore - a.giScore))}
                    </div>
                ));
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading results...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-red-100 p-3 rounded-full mb-4">
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchMeetData}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!meet) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-gray-500">No meet found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <MeetHeader
                    meetData={meet}
                    backLink={`/meets/meet-manage/${id}`}
                />

                {/* Tab Navigation */}
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overall')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overall' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}
                        >
                            <BarChart2 className="h-4 w-4 inline mr-2" />
                            Overall Results
                        </button>
                        <button
                            onClick={() => setActiveTab('weightclass')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'weightclass' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}
                        >
                            <Scale className="h-4 w-4 inline mr-2" />
                            Weight Classes
                        </button>
                        <button
                            onClick={() => setActiveTab('gender')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'gender' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}
                        >
                            <Venus className="h-4 w-4 inline mr-2" />
                            <Mars className="h-4 w-4 inline mr-2" />
                            Gender Division
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Result;