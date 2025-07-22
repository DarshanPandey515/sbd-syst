// components/Venue/VenueForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { showToast } from '../toast/toast';
import { venueApi } from '../../api/api';
import Modal from '../meet/Modal';
import BaseForm from '../ui/BaseForm';
import FormField from '../ui/FormField';
import FormGrid from '../ui/FormGrid';
import { MapPin } from 'lucide-react';

const VenueForm = ({ isOpen, onClose, onVenueAdded }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setApiError(null);

            const payload = {
                name: data.name,
                address: data.address,
                city: data.city,
                country: data.country,
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null
            };

            const response = await venueApi.create(payload);
            showToast.success('Venue created successfully!');
            onVenueAdded(response.data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error creating venue:', error);
            const errorMessage = error.response?.data
                ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
                : error.message;
            setApiError(errorMessage);
            showToast.error('Failed to create venue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <BaseForm
                title="Create New Venue"
                description="Enter details to add a new venue"
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={handleSubmit(onSubmit)}
                loading={loading}
                error={apiError}
                submitButtonText="Create Venue"
            >
                <FormGrid>
                    <FormField
                        label="Venue Name*"
                        name="name"
                        placeholder="Main Stadium"
                        icon={MapPin}
                        register={register('name', { required: 'Venue name is required' })}
                        error={errors.name}
                        disabled={loading}
                    />
                    <FormField
                        label="Address*"
                        name="address"
                        placeholder="123 Powerlift St"
                        register={register('address', { required: 'Address is required' })}
                        error={errors.address}
                        disabled={loading}
                    />
                    <FormField
                        label="City*"
                        name="city"
                        placeholder="Metropolis"
                        register={register('city', { required: 'City is required' })}
                        error={errors.city}
                        disabled={loading}
                    />
                    <FormField
                        label="Country*"
                        name="country"
                        placeholder="USA"
                        register={register('country', { required: 'Country is required' })}
                        error={errors.country}
                        disabled={loading}
                    />
                    <FormField
                        label="Latitude"
                        name="latitude"
                        type="number"
                        step="0.000001"
                        placeholder="Optional"
                        register={register('latitude')}
                        error={errors.latitude}
                        disabled={loading}
                    />
                    <FormField
                        label="Longitude"
                        name="longitude"
                        type="number"
                        step="0.000001"
                        placeholder="Optional"
                        register={register('longitude')}
                        error={errors.longitude}
                        disabled={loading}
                    />
                </FormGrid>
            </BaseForm>
        </Modal>
    );
};

export default VenueForm;