import { toast } from 'react-hot-toast';

const TOAST_STYLE = {
    background: '#1f2937',
    color: '#f3f4f6',
};

export const showToast = {
    loading: (message) => toast.loading(message, { style: TOAST_STYLE }),
    success: (message, id) => toast.success(message, {
        id,
        duration: 4000,
        style: TOAST_STYLE
    }),
    error: (message, id) => toast.error(message, {
        id,
        duration: 4000,
        style: TOAST_STYLE
    }),
};