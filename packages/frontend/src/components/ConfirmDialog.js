import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

function ConfirmDialog({
    confirmColor = 'primary',
    confirmLabel,
    description,
    isPending = false,
    onClose,
    onConfirm,
    open,
    title,
}) {
    return (
        <Dialog fullWidth maxWidth="xs" onClose={isPending ? undefined : onClose} open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button disabled={isPending} onClick={onClose} variant="text">
                    Cancel
                </Button>
                <Button color={confirmColor} disabled={isPending} onClick={onConfirm} variant="contained">
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmDialog;