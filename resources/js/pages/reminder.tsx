import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function Reminder({ reminders }) {
    const [sortedReminders, setSortedReminders] = useState([]);

    useEffect(() => {
        const sorted = [...reminders].sort((a, b) => 
            new Date(a.remind_at) - new Date(b.remind_at)
        );
        setSortedReminders(sorted);
    }, [reminders]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Мої нагадування</h1>
                    <span className="ml-2 text-sm text-muted-foreground">
                        {reminders.length} всього
                    </span>
                </div>

                {sortedReminders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sortedReminders.map(reminder => (
                            <Card key={reminder.id} className="flex flex-col h-full">
                                <CardHeader className="pb-2 flex-1">
                                    <CardTitle className="text-lg font-medium">
                                        {reminder.message}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-auto pt-0">
                                    <div className="text-sm text-muted-foreground">
                                        <p className="text-left">Закінчення о <span className="font-medium">{formatTime(reminder.remind_at)}</span></p>
                                        <p className="text-left">{formatDate(reminder.remind_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Bell className="w-12 h-12 text-muted-foreground" />
                        <p className="text-lg text-muted-foreground">Немає активних нагадувань</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}