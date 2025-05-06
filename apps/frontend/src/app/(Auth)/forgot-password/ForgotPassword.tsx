'use client';
import { z } from 'zod';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPasswordSchema } from './forgotPasswordSchema';
import FormFieldsMapper from '@src/shared/formElements/FormFieldsMapper';
import { RouteEnum } from '@src/constants/route.enum';
import { FieldConfig } from '@src/shared/types/formTypes';
import { forgotPasswordApiCall } from '@src/apiServices/authService';
import { toast } from 'react-toastify';
import { showApiErrorInToast } from '@src/utils/toastUtils';
import { SuperLink } from '@src/utils/HiLink';
import en from '@/constants/lang/en';

function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const forgotPasswordFields: FieldConfig[] = [
    {
      label: 'Enter email to recover password',
      name: 'email',
      type: 'email',
      placeholder: 'name@company.com',
    },
  ];
  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    forgotPasswordApiCall({ email: data.email })
      .then((res) => {
        toast.success(res.message);
        router.push(RouteEnum.LOGIN);
      })
      .catch((err) => {
        showApiErrorInToast(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <>
      <FormFieldsMapper
        fields={forgotPasswordFields}
        schema={forgotPasswordSchema}
        onSubmit={handleForgotPassword}
        buttonText="Send Reset Password Instructions"
        id="forgotPasswordForm"
        isLoading={isLoading}
        bigButton
      />
      <p className="text-sm text-center">
        <SuperLink href={RouteEnum.LOGIN} className="link">
          {en.Auth.Login}
        </SuperLink>
      </p>
    </>
  );
}

export default ForgotPassword;
