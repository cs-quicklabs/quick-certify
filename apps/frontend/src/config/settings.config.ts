import { FormFieldConfig } from '../types/form.types';

export const profileFormFields: FormFieldConfig[] = [
  {
    name: 'avatarUrl',
    label: 'Upload avatar',
    type: 'file',
    accept: 'image/png,image/jpg,image/jpeg',
    defaultValue: '/profile-placeholder.png',
  },
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'First Name',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Last Name',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@gmail.com',
    description: '',
    disabled: true,
  },
];

export const passwordFormFields: FormFieldConfig[] = [
  {
    name: 'currentPassword',
    label: 'Old Password',
    type: 'password',
    placeholder: '••••••••',
    required: true,
  },
  {
    name: 'newPassword',
    label: 'New Password',
    type: 'password',
    placeholder: '••••••••',
    required: true,
    description: '',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: '••••••••',
    required: true,
  },
];

export const emailPreferencesFields: FormFieldConfig[] = [
  {
    name: 'enableAllAlerts',
    label: 'Enable All Email Alerts',
    type: 'checkbox',
    description: 'If disabled, no email alert will land in your inbox.',
  },
];
