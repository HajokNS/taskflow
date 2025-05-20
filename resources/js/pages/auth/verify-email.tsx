// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout 
            title="Підтвердження email" 
            description="Будь ласка, підтвердьте свою електронну адресу, натиснувши на посилання, яке ми щойно відправили вам на пошту."
        >
            <Head title="Підтвердження email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Нове посилання для підтвердження було відправлено на електронну адресу, яку ви вказали під час реєстрації.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Надіслати лист для підтвердження ще раз
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    Вийти
                </TextLink>
            </form>
        </AuthLayout>
    );
}