import React from 'react';
import ForgotPassword from './ForgotPassword';
import { AuthTemplate } from '@/shared/pageTemplates/AuthTemplate';

const ForgotPasswordPage = () => {
  return (
    <AuthTemplate title="Forgot Password?">
      <ForgotPassword />
    </AuthTemplate>
  );
};

export default ForgotPasswordPage;
