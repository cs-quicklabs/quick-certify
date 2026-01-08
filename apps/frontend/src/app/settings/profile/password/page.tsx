'use client';

import { ConfigForm } from '../../../../components/ConfigForm';
import { passwordFormFields } from '../../../../config/settings.config';
import { changePasswordSchema, ChangePasswordData } from '../../../../schemas/settings.schema';
import { useChangePassword } from '../../../../hooks/useSettings';
import { FormConfig } from '../../../../types/form.types';

export default function ChangePasswordPage() {
  const changePassword = useChangePassword();

  const formConfig: FormConfig<typeof changePasswordSchema> = {
    title: 'Change Password',
    subtitle: 'Setup a new password for your account',
    fields: passwordFormFields,
    schema: changePasswordSchema,
    submitLabel: 'Save',
    onSubmit: async (data: ChangePasswordData) => {
      await changePassword.mutateAsync(data);
    },
  };

  return <ConfigForm config={formConfig} />;
}
