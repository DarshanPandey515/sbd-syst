// MeetForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { showToast } from '../toast/toast';
import { meetApi, venueApi, weightClassApi } from '../../api/api';
import Modal from '../meet/Modal';
import BaseForm from '../ui/BaseForm';
import FormField from '../ui/FormField';
import FormGrid from '../ui/FormGrid';
import { Calendar, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const MeetForm = ({ isOpen, onClose, onMeetAdded }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [venues, setVenues] = useState([]);
    const [existingWeightClasses, setExistingWeightClasses] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(false);

    useEffect(() => {
        if (isOpen) {
            reset();
            fetchInitialData();
        }
    }, [isOpen, reset]);

    const fetchInitialData = async () => {
        try {
            setIsFetchingData(true);
            const [venuesResponse, weightClassesResponse] = await Promise.all([
                venueApi.getAll(),
                weightClassApi.getAll()
            ]);
            setVenues(venuesResponse.data);
            setExistingWeightClasses(weightClassesResponse.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showToast.error('Failed to load required data');
        } finally {
            setIsFetchingData(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setApiError(null);

            const selectedWeightClassIds = data.weight_classes ? data.weight_classes.map(id => parseInt(id)) : [];

            if (selectedWeightClassIds.length === 0) {
                throw new Error("At least one weight class is required");
            }

            const meetData = {
                name: data.name,
                date: data.date,
                venue_id: parseInt(data.venue),
                weight_class_ids: selectedWeightClassIds
            };

            const response = await meetApi.create(meetData);
            showToast.success('Meet created successfully!');
            onMeetAdded(response.data);
            onClose();
        } catch (error) {
            console.error('Error creating meet:', error);
            const errorMessage = error.response?.data
                ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
                : error.message;
            setApiError(errorMessage);
            showToast.error('Failed to create meet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <BaseForm
                title="Create New Meet"
                description="Select details below to schedule a new competition"
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={handleSubmit(onSubmit)}
                loading={loading}
                error={apiError}
                submitButtonText="Create Meet"
            >
                <FormGrid>
                    <FormField
                        label="Meet Name*"
                        name="name"
                        placeholder="Olympic Weightlifting Championship"
                        icon={MapPin}
                        register={register('name', { required: 'Meet name is required' })}
                        error={errors.name}
                        disabled={loading || isFetchingData}
                    />

                    <FormField
                        label="Event Date*"
                        name="date"
                        type="date"
                        icon={Calendar}
                        register={register('date', { required: 'Date is required' })}
                        error={errors.date}
                        disabled={loading || isFetchingData}
                    />

                    <FormField
                        label="Venue*"
                        name="venue"
                        type="select"
                        register={register('venue', { required: 'Venue is required' })}
                        error={errors.venue}
                        disabled={loading || isFetchingData || venues.length === 0}
                        options={[
                            { value: '', label: 'Select a venue' },
                            ...venues.map(venue => ({
                                value: venue.id,
                                label: `${venue.name}, ${venue.city}`
                            }))
                        ]}
                    />

                    <div className="col-span-full space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Select Weight Classes*</h3>
                        {isFetchingData && existingWeightClasses.length === 0 ? (
                            <p className="text-sm text-gray-500">Loading weight classes...</p>
                        ) : (
                            <FormField
                                name="weight_classes"
                                type="checkbox-group"
                                register={register('weight_classes', { required: 'At least one weight class is required' })}
                                error={errors.weight_classes}
                                disabled={loading}
                                options={existingWeightClasses.map(wc => ({
                                    value: wc.id,
                                    label: wc.name,
                                    description: `${wc.max_weight}kg • ${wc.gender === 'M' ? 'Male' : wc.gender === 'F' ? 'Female' : 'Non-Binary'}`
                                }))}
                            />
                        )}
                    </div>
                </FormGrid>
            </BaseForm>
        </Modal>
    );
};

export default MeetForm;