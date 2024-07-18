import {Alert, Button} from '@mui/material';
import {toast} from 'react-toastify';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

const renderToastComponent = (message: string | JSX.Element, type: ToastType) => (
    <Alert severity={type}>{message}</Alert>
);

export const buildToast = (message: string | JSX.Element, type: ToastType) => {
    return toast(renderToastComponent(message, type), {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        style: {
            backgroundColor: 'transparent',
        },
    });
};

export const successToast = (message: string | JSX.Element) => buildToast(message, 'success');
export const errorToast = (message: string | JSX.Element) => buildToast(message, 'error');
export const infoToast = (message: string | JSX.Element) => buildToast(message, 'info');
export const warningToast = (message: string | JSX.Element) => buildToast(message, 'warning');

export const generateErrorWithLink = (message: string, link: string) => {
    return (
        <>
            {message}
            <br />
            If the error persists:
            <br />
            <br />

            <Button href={link} variant="contained" color="primary" target="_blank">
                Report issue
            </Button>
        </>
    );
};
