'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens } from '@/services';
import { AuthProvider, FormConfig } from '@/types';
import { useChangePassword, useDisconnectGoogle } from '@/hooks/useSettings';
import { useAuthStore } from '@/store/auth.store';
import { ChangePasswordData, changePasswordSchema } from '@/schemas/settings.schema';
import { passwordFormFields } from '@/config/settings.config';
import { ConfigForm } from '@/components/ConfigForm';
import { showSuccessToast } from '@/lib/toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const disconnectGoogleAuth = useDisconnectGoogle();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const formConfig: FormConfig<typeof changePasswordSchema> = useMemo(
    () => ({
      title: 'Change Password',
      subtitle: 'Setup a new password for your account',
      fields: passwordFormFields,
      schema: changePasswordSchema,
      submitLabel: 'Save',
      resetOnSuccess: true,
      onSubmit: async (data: ChangePasswordData) => {
        const response = await changePassword.mutateAsync(data);
        if (response.sessionsRevoked) {
          clearTokenAndRedirectToLogin();
        }
      },
    }),
    [changePassword],
  );

  function clearTokenAndRedirectToLogin() {
    // Clear tokens and user state
    clearTokens();
    setUser(null);

    // Redirect to login page
    router.push('/login');
  }

  const disconnectGoogle = async () => {
    const response = await disconnectGoogleAuth.mutateAsync();
    if (response.success) {
      showSuccessToast(response.message);
      clearTokenAndRedirectToLogin();
    }
  };

  if (user?.authProvider === AuthProvider.Google) {
    return (
      <>
        <div className="mb-4">
          <h1 className="form-title">Change Password</h1>
          <p className="form-subtitle">Setup a new password for your account</p>
        </div>
        <div>
          <p className="text-gray-700 text-sm">
            There is no password associated with this account as you've signed up using Google. In
            order to setup a new password, you need to disconnect your google account first. Once
            done, you will be able to login with your new password.
          </p>
          <button className="link mt-2" onClick={disconnectGoogle}>
            Disconnect Google &amp; Reset Password
          </button>
        </div>
      </>
    );
  }

  return <ConfigForm config={formConfig} />;
}
