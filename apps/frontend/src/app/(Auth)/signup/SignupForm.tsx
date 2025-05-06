'use client';

import React, { useState } from 'react';
import { signupFormSchema } from './signupFormSchema';
import { FieldConfig } from '@src/shared/types/formTypes';
import FormFieldsMapper from '@src/shared/formElements/FormFieldsMapper';
import { RouteEnum } from '@src/constants/route.enum';
import { RegisterPayload } from '@src/shared/types/authTypes';
import { useRouter } from 'next/navigation';
import { showApiErrorInToast } from '@src/utils/toastUtils';
import { toast } from 'react-toastify';
import { signupApiCall } from '@/apiServices/authService';
import { SuperLink } from '@/utils/HiLink';

function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signupFields: (FieldConfig | FieldConfig[])[] = [
    [
      {
        label: 'First Name',
        name: 'firstName',
        type: 'text',
        placeholder: 'John',
      },
      {
        label: 'Last Name',
        name: 'lastName',
        type: 'text',
        placeholder: 'Doe',
      },
    ],
    {
      label: 'Your email',
      name: 'email',
      type: 'email',
      placeholder: 'name@company.com',
    },
    {
      label: 'Issuer name',
      name: 'organizationName',
      type: 'text',
      placeholder: 'Issuer or company name',
    },
    {
      label: 'Issuer Website URL',
      name: 'organizationWebsite',
      type: 'text',
      placeholder: 'Website URL',
    },
    [
      {
        label: 'Password',
        name: 'password',
        type: 'password',
        placeholder: '••••••••',
      },
      {
        label: 'Confirm Password',
        name: 'confirmPassword',
        type: 'password',
        placeholder: '••••••••',
      },
    ],
  ];

  const handleSignup = async (data: RegisterPayload) => {
    setIsLoading(true);
    signupApiCall(data)
      .then((res) => {
        router.replace(RouteEnum.LOGIN);
        toast.success(res.message);
      })
      .catch(showApiErrorInToast)
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <FormFieldsMapper
        fields={signupFields}
        schema={signupFormSchema}
        onSubmit={handleSignup}
        buttonDisabled={isLoading}
        isLoading={isLoading}
        bigButton
        buttonText="Create New Issuer Account"
        id="loginForm"
      />

      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
        <span className="font-light">Already have an account?</span>

        <SuperLink
          href={RouteEnum.LOGIN}
          className="font-medium text-primary-500 hover:underline ml-2"
        >
          Login
        </SuperLink>
      </p>
    </>
  );
}

export default Login;
