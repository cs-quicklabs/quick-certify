import React from 'react';
import { Metadata } from 'next';
import Login from './(Auth)/login/Login';
import { AuthTemplate } from '@/shared/pageTemplates/AuthTemplate';

export const metadata: Metadata = {
  title: 'Login • Quick Certify',
  description: 'Login to your Quick Certify account and start your journey towards success.',
};

function LoginPage() {
  return (
    <AuthTemplate title="Sign in to your account">
      <Login />
    </AuthTemplate>
  );
}

export default LoginPage;