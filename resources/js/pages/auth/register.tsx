import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import {toast,  Toaster} from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Валідація
        const validationErrors: string[] = [];

        if (!data.name.trim()) {
            validationErrors.push("Ім'я є обов'язковим");
        }

        if (!data.email.trim()) {
            validationErrors.push("Електронна адреса є обов'язковою");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            validationErrors.push("Невірний формат електронної адреси");
        }

        if (!data.password) {
            validationErrors.push("Пароль є обов'язковим");
        }

        if (data.password !== data.password_confirmation) {
            validationErrors.push("Паролі не співпадають");
        }

        if (validationErrors.length > 0) {
            validationErrors.forEach(msg => toast.error(msg));
            return;
        }

        post(route('register'), {
    onFinish: () => reset('password', 'password_confirmation'),
    onError: (err) => {
        Object.values(err).forEach((msg) => {
            let errorMessage = Array.isArray(msg) ? msg[0] : msg;
            
            // Переклад помилок
            switch (errorMessage) {
                case 'The email has already been taken.':
                    errorMessage = 'Ця електронна адреса вже використовується';
                    break;
                case 'The password field must be at least 8 characters.':
                    errorMessage = 'Пароль має містити щонайменше 8 символів';
                    break;
                case 'The name field is required.':
                    errorMessage = "Ім'я є обов'язковим";
                    break;
                case 'The email field is required.':
                    errorMessage = 'Електронна адреса є обов\'язковою';
                    break;
                case 'The password field is required.':
                    errorMessage = 'Пароль є обов\'язковим';
                    break;
                case 'The password confirmation does not match.':
                    errorMessage = 'Паролі не співпадають';
                    break;
                default:
                    errorMessage = 'Помилка: ' + errorMessage; // або залишаємо як є
            }

            toast.error(errorMessage);
        });
    },
});
    };

    return (
        <AuthLayout 
            title="Створення облікового запису" 
            description="Введіть свої дані для реєстрації"
        >
            <Head title="Реєстрація" />
            <Toaster position="top-center" richColors  />
            <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Ім'я</Label>
                        <Input
                            id="name"
                            type="text"
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Повне ім'я"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Електронна адреса</Label>
                        <Input
                            id="email"
                            type="email"
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        /> 
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Пароль"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Підтвердження паролю</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Підтвердіть пароль"
                        />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Створити обліковий запис
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Вже маєте обліковий запис?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Увійти
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
