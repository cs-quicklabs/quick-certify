'use client';

import React, { useState } from 'react';
import { loginFormSchema } from './loginFormSchema';
import { FieldConfig } from '@src/shared/types/formTypes';
import FormFieldsMapper from '@src/shared/formElements/FormFieldsMapper';
import { RouteEnum } from '@src/constants/route.enum';
import { LoginCredentials } from '@src/shared/types/authTypes';
import { useRouter } from 'next/navigation';
import { showApiErrorInToast } from '@src/utils/toastUtils';
import { toast } from 'react-toastify';
import { loginApiCall } from '@/apiServices/authService';

function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginFields: FieldConfig[] = [
    {
      label: 'Email',
      name: 'email',
      type: 'email',
      placeholder: 'name@company.com',
    },
    {
      label: 'Password',
      name: 'password',
      type: 'password',
      placeholder: '••••••••',
    },
    { label: 'Remember me', name: 'rememberMe', type: 'checkbox' },
  ];


  const handleLogin = async (data: LoginCredentials) => {
    setIsLoading(true);
    loginApiCall(data)
      .then((res) => {
        const params = new URLSearchParams(window.location.search);
        let redirect = params.get('redirect');
        if (!redirect) {
          redirect = RouteEnum.DASHBOARD;
        }

        router.replace(redirect);
        toast.success(res.message);
      })
      .catch(showApiErrorInToast)
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <FormFieldsMapper
      fields={loginFields}
      schema={loginFormSchema}
      onSubmit={handleLogin}
      buttonDisabled={isLoading}
      bigButton
      buttonText="Sign In"
      id="loginForm"
    />
  );
}

export default Login;
