import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPassword from './ResetPassword';
import { AuthTemplate } from '@/shared/pageTemplates/AuthTemplate';
import en from '@/constants/lang/en';

export const metadata: Metadata = {
  title: 'Reset Password • Quick Certify',
  description: 'Reset your password in Quick Certify from Crownstack',
};

function ResetPasswordPage() {
  return (
    <Suspense fallback={<h1>{en.Auth.loading}</h1>}>
      <AuthTemplate title="Set a new password">
        <ResetPassword />
      </AuthTemplate>
    </Suspense>
  );
}

export default ResetPasswordPage;
