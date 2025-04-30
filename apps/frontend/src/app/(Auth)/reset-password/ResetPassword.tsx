'use client';
import React, { useState } from 'react';
import { z } from 'zod';
import FormFieldsMapper from '@src/shared/formElements/FormFieldsMapper';
import { FieldConfig } from '@src/shared/types/formTypes';
import { resetPasswordApiCall } from '@src/apiServices/authService';
import { toast } from 'react-toastify';
import { showApiErrorInToast } from '@src/utils/toastUtils';
import { useRouter, useSearchParams } from 'next/navigation';
import { RouteEnum } from '@src/constants/route.enum';
import { resetPasswordFormSchema } from './ResetPasswordSchema';
import { SuperLink } from '@/utils/HiLink';
import en from '@/constants/lang/en';

function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const resetPasswordFields: FieldConfig[] = [
    {
      label: 'New Password',
      name: 'newPassword',
      type: 'password',
      placeholder: '••••••••',
    },
    {
      label: 'Confirm Password',
      name: 'confirmPassword',
      type: 'password',
      placeholder: '••••••••',
    },
  ];
  type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    const payload = {
      token: token as string,
      newPassword: data.confirmPassword,
    };
    resetPasswordApiCall(payload)
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
        fields={resetPasswordFields}
        schema={resetPasswordFormSchema}
        onSubmit={handleResetPassword}
        buttonText="Change password"
        id="resetPasswordForm"
        isLoading={isLoading}
        bigButton
      />
      <p className="text-sm  text-center">
        <SuperLink
          href={RouteEnum.LOGIN}
          className="font-medium text-primary-500  hover:underline"
        >
          {en.Auth.Login}
        </SuperLink>
      </p>
    </>
  );
}

export default ResetPassword;
