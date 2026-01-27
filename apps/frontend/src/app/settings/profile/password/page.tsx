'use client';

import { useRouter } from 'next/navigation';
import { ConfigForm } from '../../../../components/ConfigForm';
import { passwordFormFields } from '../../../../config/settings.config';
import { changePasswordSchema, ChangePasswordData } from '../../../../schemas/settings.schema';
import { useChangePassword } from '../../../../hooks/useSettings';
import { FormConfig } from '../../../../types/form.types';
import { useAuthStore } from '../../../../store/auth.store';
import { clearTokens } from '@/services';

export default function ChangePasswordPage() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const setUser = useAuthStore((state) => state.setUser);

  const formConfig: FormConfig<typeof changePasswordSchema> = {
    title: 'Change Password',
    subtitle: 'Setup a new password for your account',
    fields: passwordFormFields,
    schema: changePasswordSchema,
    submitLabel: 'Save',
    resetOnSuccess: true,
    onSubmit: async (data: ChangePasswordData) => {
      const response = await changePassword.mutateAsync(data);

      // If sessions were revoked, logout user and redirect to login
      if (response.sessionsRevoked) {
        // Clear tokens and user state
        clearTokens();
        setUser(null);

        // Redirect to login page
        router.push('/login');
      }
    },
  };

  return <ConfigForm config={formConfig} />;
}
