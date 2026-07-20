'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const SignIn = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if (result.success) {
                router.push('/');
            } else {
                toast.error('Sign in failed', {
                    description: result.error || 'Failed to sign in.'
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Sign in failed', {
                description: e instanceof Error ? e.message : 'An unexpected error occurred.'
            });
        }
    }

    return (
        <div className="auth-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Email Address"
                        className="form-input w-full"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                {/* Password with toggle */}
                <div className="space-y-2">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="Password"
                            className="form-input w-full pr-12"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' }
                            })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    <div className="text-right">
                        <Link href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                {/* Sign In Button */}
                <Button type="submit" disabled={isSubmitting} className="emerald-btn w-full mt-2">
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>

            {/* Footer Link */}
            <FooterLink text="Don't have an account?" linkText="Sign up." href="/sign-up" />
        </div>
    );
};
export default SignIn;
