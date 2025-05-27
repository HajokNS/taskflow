import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast, Toaster } from 'sonner'; // або 'react-hot-toast'

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Перевірка на клієнті
        const validationErrors: string[] = [];

        if (!data.email.trim()) {
            validationErrors.push("Електронна адреса є обов'язковою");
        }

        if (!data.password) {
            validationErrors.push("Пароль є обов'язковим");
        }

        if (validationErrors.length > 0) {
            validationErrors.forEach(msg => toast.error(msg));
            return;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
            onError: (err) => {
                Object.values(err).forEach((msg) => {
                    let errorMessage = Array.isArray(msg) ? msg[0] : msg;

                    // Переклад помилок
                    switch (errorMessage) {
                        case 'These credentials do not match our records.':
                            errorMessage = 'Невірна електронна адреса або пароль';
                            break;
                        case 'The email field is required.':
                            errorMessage = 'Електронна адреса є обов\'язковою';
                            break;
                        case 'The password field is required.':
                            errorMessage = 'Пароль є обов\'язковим';
                            break;
                        default:
                            errorMessage = 'Помилка: ' + errorMessage;
                    }

                    toast.error(errorMessage);
                });
            },
        });
    };

    return (
        <AuthLayout 
            title="Увійдіть до свого облікового запису" 
            description="Введіть свою електронну адресу та пароль для входу"
        >
            <Head title="Вхід" />
            <Toaster position="top-center" richColors />

            <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Електронна адреса</Label>
                        <Input
                            id="email"
                            type="email"
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        {/* <InputError message={errors.email} /> */} {/* Прибрано */}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Пароль</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Забули пароль?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Пароль"
                        />
                        {/* <InputError message={errors.password} /> */} {/* Прибрано */}
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Запам'ятати мене</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Увійти
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Ще немає облікового запису?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Зареєструватися
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
