'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/auth.schema';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROUTES } from '@/config/routes';
type LoginFormInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export const useLogin = () => {
  const router = useRouter();
  const { setUser, setError: setGlobalError, clearError, error: globalError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const formMethods = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormInput) => {
    clearError();
    setIsLoading(true);

    try {
      await authService.login({
        email: data.email,
        password: data.password,
      });

      // Fetch current user after login
      const user = await authService.getCurrentUser();
      setUser(user);

      // Redirect based on role
      if (user.role === 'system_admin') {
        router.push(ROUTES.ADMIN.ORGANIZATIONS);
      } else {
        router.push(ROUTES.DASHBOARD.HOME);
      }
    } catch (error) {
      setGlobalError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formMethods,
    onSubmit: formMethods.handleSubmit(onSubmit),
    globalError,
    clearError,
    isLoading: isLoading || formMethods.formState.isSubmitting,
  };
};
