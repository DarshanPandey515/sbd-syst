import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, ArrowLeft, Users, CircleUser, CircleUserRound, Dumbbell } from 'lucide-react';
import { showToast } from '../components/toast/toast';
import { meetApi, participantApi, weightClassApi, teamApi } from '../api/api';
import Table from '../components/ui/Table';
import Modal from '../components/meet/Modal';
import BaseForm from '../components/ui/BaseForm';
import FormField from '../components/ui/FormField';
import FormGrid from '../components/ui/FormGrid';
import MeetHeader from '../components/ui/MeetHeader';



const Participant = () => {
    const { id: meetId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [meet, setMeet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [weightClasses, setWeightClasses] = useState([]);
    const [teams, setTeams] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm();

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [participantsRes, meetRes, weightClassesRes, teamsRes] = await Promise.all([
                meetApi.getParticipants(meetId),
                meetApi.getById(meetId),
                weightClassApi.getAll(),
                teamApi.getAll()
            ]);
            setParticipants(participantsRes.data);
            setMeet(meetRes.data);
            const meetWeightClassIds = meetRes.data.weight_classes.map(wc => wc.id);
            setWeightClasses(weightClassesRes.data.filter(wc => meetWeightClassIds.includes(wc.id)));
            setTeams(teamsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load participants. Please try again.');
            showToast.error('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [meetId]);

    const onSubmit = async (data) => {
        try {
            const selectedWeightClass = weightClasses.find(wc => wc.id === parseInt(data.weight_class_id));
            const bodyWeight = parseFloat(data.body_weight);

            if (selectedWeightClass) {
                if (selectedWeightClass.min_weight && bodyWeight < selectedWeightClass.min_weight) {
                    showToast.error(`Body weight must be at least ${selectedWeightClass.min_weight}kg for ${selectedWeightClass.name}`);
                    return;
                }
                if (bodyWeight > selectedWeightClass.max_weight) {
                    showToast.error(`Body weight must be at most ${selectedWeightClass.max_weight}kg for ${selectedWeightClass.name}`);
                    return;
                }
                if (selectedWeightClass.gender !== data.gender) {
                    showToast.error(`Weight class ${selectedWeightClass.name} is for ${selectedWeightClass.gender === 'M' ? 'Male' : 'Female'} only`);
                    return;
                }
            }

            const participantData = {
                meet: parseInt(meetId),
                name: data.name,
                date_of_birth: data.date_of_birth,
                gender: data.gender,
                body_weight: bodyWeight,
                weight_class_id: parseInt(data.weight_class_id),
                team: data.team ? parseInt(data.team) : null
            };

            const response = await participantApi.create(participantData);
            setParticipants(prev => [...prev, response.data]);
            setIsModalOpen(false);
            reset();
            showToast.success('Participant added successfully!');
        } catch (error) {
            console.error('Error adding participant:', error);
            const errorMsg = error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                Object.values(error.response?.data || {})[0]?.[0] ||
                'Failed to add participant. Please check the form data.';
            showToast.error(errorMsg);
        }
    };

    const participantData = useMemo(() => participants, [participants]);

    const columns = [
        {
            key: 'name',
            header: 'Name',
            sortable: false,
            loadingWidth: '32'
        },
        {
            key: 'gender',
            header: 'Gender',
            sortable: false,
            loadingWidth: '16'
        },
        {
            key: 'date_of_birth',
            header: 'Date of Birth',
            sortable: false,
            loadingWidth: '24'
        },
        {
            key: 'body_weight',
            header: 'Body Weight',
            sortable: false,
            loadingWidth: '24'
        },
        {
            key: 'weight_class',
            header: 'Weight Class',
            sortable: false,
            loadingWidth: '32'
        },
        {
            key: 'team',
            header: 'Team',
            sortable: false,
            loadingWidth: '24'
        }
    ];

    const rowRenderer = ({ item: participant }) => (
        <tr key={participant.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{participant.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{participant.gender === 'M' ? 'Male' : 'Female'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                    {new Date(participant.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{participant.body_weight} kg</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{participant.weight_class?.name || 'N/A'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{participant.team?.name || 'None'}</div>
            </td>
        </tr>
    );

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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <MeetHeader
                    meetData={meet}
                    backLink={`/meets/meet-manage/${meetId}`}
                    actionButton={
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Participant
                        </button>
                    }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-gray-500" />
                            <h3 className="text-sm text-gray-500 font-medium">Total Participants</h3>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{participants.length}</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <CircleUser className="w-5 h-5 text-blue-500" />
                            <h3 className="text-sm text-gray-500 font-medium">Male</h3>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {participants.filter(p => p.gender === 'M').length}
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <CircleUserRound className="w-5 h-5 text-pink-500" />
                            <h3 className="text-sm text-gray-500 font-medium">Female</h3>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {participants.filter(p => p.gender === 'F').length}
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <Dumbbell className="w-5 h-5 text-gray-600" />
                            <h3 className="text-sm text-gray-500 font-medium">Unique Weight Classes</h3>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {new Set(participantData.map(p => p.weight_class?.name)).size}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={participantData}
                            loading={loading}
                            error={error}
                            emptyStateMessage="No participants found"
                            rowRenderer={rowRenderer}
                        />
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <BaseForm
                    title="Add New Participant"
                    description="Enter participant details below"
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit(onSubmit)}
                    loading={loading}
                    submitButtonText="Add Participant"
                    cancelButtonText="Cancel"
                >
                    <FormGrid>
                        <FormField
                            label="Full Name*"
                            name="name"
                            placeholder="John Doe"
                            register={register('name', { required: 'Full name is required' })}
                            error={errors.name}
                            disabled={loading}
                        />

                        <FormField
                            label="Date of Birth*"
                            name="date_of_birth"
                            type="date"
                            register={register('date_of_birth', { required: 'Date of birth is required' })}
                            error={errors.date_of_birth}
                            disabled={loading}
                        />

                        <FormField
                            label="Gender*"
                            name="gender"
                            type="select"
                            register={register('gender', { required: 'Gender is required' })}
                            error={errors.gender}
                            disabled={loading}
                            options={[
                                { value: '', label: 'Select Gender' },
                                { value: 'M', label: 'Male' },
                                { value: 'F', label: 'Female' }
                            ]}
                        />

                        <FormField
                            label="Body Weight (kg)*"
                            name="body_weight"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 72.5"
                            register={register('body_weight', {
                                required: 'Body weight is required',
                                valueAsNumber: true
                            })}
                            error={errors.body_weight}
                            disabled={loading}
                        />

                        <FormField
                            label="Weight Class*"
                            name="weight_class_id"
                            type="select"
                            register={register('weight_class_id', { required: 'Weight class is required' })}
                            error={errors.weight_class_id}
                            disabled={loading || weightClasses.length === 0}
                            options={[
                                { value: '', label: 'Select Weight Class' },
                                ...weightClasses.map(wc => ({
                                    value: wc.id,
                                    label: `${wc.name} (${wc.min_weight ? `${wc.min_weight}-` : ''}${wc.max_weight}kg)`
                                }))
                            ]}
                        />

                        <FormField
                            label="Team"
                            name="team"
                            type="select"
                            register={register('team')}
                            disabled={loading || teams.length === 0}
                            options={[
                                { value: '', label: 'No Team' },
                                ...teams.map(team => ({
                                    value: team.id,
                                    label: team.name
                                }))
                            ]}
                        />
                    </FormGrid>
                </BaseForm>
            </Modal>
        </div>
    );
};

export default Participant;