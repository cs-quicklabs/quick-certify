import { FormFieldConfig } from '../types/form.types';

/**
 * Add Team Member Form Fields
 */
export const addTeamMemberFormFields: FormFieldConfig[] = [
    {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'Enter first name',
        required: true,
    },
    {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Enter last name',
        required: true,
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'member@example.com',
        required: true,
    },
    {
        name: 'roleId',
        label: 'User Role',
        type: 'select',
        required: true,
        description: '',
        tooltipText: 'A team member can be either Admin, Manager or Designer.',
    },
];

/**
 * Edit Team Member Form Fields
 */
export const editTeamMemberFormFields: FormFieldConfig[] = [
    {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
        required: true,
    },
    {
        name: 'last_name',
        label: 'Last Name',
        type: 'text',
        required: true,
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
    },
    {
        name: 'roleId',
        label: 'User Role',
        type: 'select',
        required: true,
        description: 'A team member can be either Admin, Manager or Designer.',
        tooltipText: 'A team member can be either Admin, Manager or Designer.',
    },
    {
        name: 'status',
        label: 'Active',
        type: 'select',
        required: true,
        description: 'Mark member as active or inactive.',
        tooltipText: 'Mark member as active or inactive.',
    },
];

