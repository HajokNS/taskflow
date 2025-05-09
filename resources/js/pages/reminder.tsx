import React, { useEffect, useState } from 'react';
import { Reminder as ReminderType, SharedData } from '../types';
import { fetchReminders, createReminder, updateReminder, deleteReminder } from '../api/reminders';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Button, List, ListItem, ListItemText, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { usePage } from '@inertiajs/react';

const RemindersPage = () => {
    const { user } = usePage<SharedData>().props.auth;
    const [reminders, setReminders] = useState<ReminderType[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentReminder, setCurrentReminder] = useState<Partial<ReminderType> | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState('');

    useEffect(() => {
        if (user) {
            loadReminders();
        }
    }, [user]);

    const loadReminders = async () => {
        try {
            const data = await fetchReminders();
            setReminders(data);
        } catch (error) {
            console.error('Failed to load reminders:', error);
        }
    };

    const handleOpenCreateDialog = () => {
        setCurrentReminder({
            task_id: '',
            remind_at: new Date(),
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (reminder: ReminderType) => {
        setCurrentReminder(reminder);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentReminder(null);
    };

    const handleSubmit = async () => {
        if (!currentReminder) return;

        try {
            if (currentReminder.id) {
                await updateReminder(currentReminder.id, {
                    remind_at: currentReminder.remind_at,
                });
            } else {
                await createReminder({
                    task_id: selectedTaskId,
                    remind_at: currentReminder.remind_at,
                });
            }
            loadReminders();
            handleCloseDialog();
        } catch (error) {
            console.error('Failed to save reminder:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteReminder(id);
            loadReminders();
        } catch (error) {
            console.error('Failed to delete reminder:', error);
        }
    };

    return (
        <div>
            <h1>Reminders</h1>
            <Button variant="contained" onClick={handleOpenCreateDialog}>
                Add Reminder
            </Button>

            <List>
                {reminders.map((reminder) => (
                    <ListItem key={reminder.id}>
                        <ListItemText
                            primary={`Task: ${reminder.task.title}`}
                            secondary={`Remind at: ${new Date(reminder.remind_at).toLocaleString()}`}
                        />
                        <IconButton onClick={() => handleOpenEditDialog(reminder)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(reminder.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{currentReminder?.id ? 'Edit Reminder' : 'Create Reminder'}</DialogTitle>
                <DialogContent>
                    {!currentReminder?.id && (
                        <TextField
                            label="Task ID"
                            value={selectedTaskId}
                            onChange={(e) => setSelectedTaskId(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    )}
                    <DateTimePicker
                        label="Remind At"
                        value={currentReminder?.remind_at || null}
                        onChange={(date) => setCurrentReminder({ ...currentReminder, remind_at: date })}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RemindersPage;