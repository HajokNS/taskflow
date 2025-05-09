import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Board {
    id: string;
    title: string;
    description?: string;
    color: string;
}

interface Props extends PageProps {
    activeBoard?: Board;
}

export default function Dashboard({ activeBoard }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {!activeBoard ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
                    <PlaceholderPattern className="h-32 w-32 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-bold text-gray-800 dark:text-white">
                        У вас не відкрита дошка
                    </h2>
                    <p className="mt-2 text-muted-foreground max-w-md">
                        Для того щоб відкрити дошку перейдіть на панель{' '}
                        <Link href={route('boards.index')} className="text-primary hover:underline">
                            Дошки
                        </Link>
                    </p>
                    <Button className="mt-6" asChild>
                        <Link href={route('boards.index')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Перейти до дошок
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {activeBoard.title}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <span 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: activeBoard.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                                Активна дошка
                            </span>
                        </div>
                    </div>

                    {activeBoard.description && (
                        <p className="text-muted-foreground">
                            {activeBoard.description}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Прогрес</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Progress value={45} className="h-2" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    45% завдань виконано
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Статистика</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Загалом завдань:
                                        </span>
                                        <span className="font-medium">24</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Виконано:
                                        </span>
                                        <span className="font-medium">11</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Швидкі дії</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full mb-2">
                                    Додати завдання
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Налаштування дошки
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}