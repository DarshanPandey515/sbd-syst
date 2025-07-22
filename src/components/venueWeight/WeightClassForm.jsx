// components/WeightClass/WeightClassForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { showToast } from '../toast/toast';
import { weightClassApi } from '../../api/api';
import Modal from '../meet/Modal';
import BaseForm from '../ui/BaseForm';
import FormField from '../ui/FormField';
import FormGrid from '../ui/FormGrid';

const WeightClassForm = ({ isOpen, onClose, onWeightClassAdded }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setApiError(null);

            const payload = {
                name: data.name,
                max_weight: parseFloat(data.max_weight),
                gender: data.gender,
                min_weight: data.min_weight ? parseFloat(data.min_weight) : null
            };

            const response = await weightClassApi.create(payload);
            showToast.success('Weight class created successfully!');
            onWeightClassAdded(response.data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error creating weight class:', error);
            const errorMessage = error.response?.data
                ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
                : error.message;
            setApiError(errorMessage);
            showToast.error('Failed to create weight class');
        } finally {
            setLoading(false);
        }
    };

    const genderOptions = [
        { value: 'M', label: 'Male' },
        { value: 'F', label: 'Female' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <BaseForm
                title="Create New Weight Class"
                description="Enter details to add a new weight class"
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={handleSubmit(onSubmit)}
                loading={loading}
                error={apiError}
                submitButtonText="Create Weight Class"
            >
                <FormGrid>
                    <FormField
                        label="Weight Class Name*"
                        name="name"
                        placeholder="Lightweight"
                        register={register('name', { required: 'Weight class name is required' })}
                        error={errors.name}
                        disabled={loading}
                    />
                    <FormField
                        label="Min Weight (kg)"
                        name="min_weight"
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        register={register('min_weight')}
                        error={errors.min_weight}
                        disabled={loading}
                    />
                    <FormField
                        label="Max Weight (kg)*"
                        name="max_weight"
                        type="number"
                        step="0.01"
                        placeholder="74.00"
                        register={register('max_weight', { required: 'Max weight is required' })}
                        error={errors.max_weight}
                        disabled={loading}
                    />
                    <FormField
                        label="Gender*"
                        name="gender"
                        type="select"
                        register={register('gender', { required: 'Gender is required' })}
                        error={errors.gender}
                        disabled={loading}
                        options={genderOptions}
                    />
                </FormGrid>
            </BaseForm>
        </Modal>
    );
};

export default WeightClassForm;