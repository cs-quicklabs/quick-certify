import React from 'react';
import SignupForm from './SignupForm';
import { AuthTemplate } from '@/shared/pageTemplates/AuthTemplate';

const SignupPage = () => {
  return (
    <AuthTemplate title="Register new issuer account">
      <SignupForm />
    </AuthTemplate>
  );
};

export default SignupPage;
