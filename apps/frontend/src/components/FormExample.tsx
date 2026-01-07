/**
 * Zod Form Validation Example
 *
 * This component demonstrates how to use Zod for form validation.
 */

'use client';

import { useState } from 'react';
import { loginSchema, type LoginFormData } from '../schemas/user.schema';
import { formatZodErrors } from '../lib/validation';

export function FormExample() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      // Format and display errors
      setErrors(formatZodErrors(result.error));
      return;
    }

    // Form is valid, submit data
    setErrors({});
    console.log('Valid form data:', result.data);
    alert('Form submitted successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Zod Form Validation Example</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: errors.email ? '1px solid red' : '1px solid #ccc',
            }}
          />
          {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: errors.password ? '1px solid red' : '1px solid #ccc',
            }}
          />
          {errors.password && (
            <span style={{ color: 'red', fontSize: '12px' }}>{errors.password}</span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              style={{ marginRight: '5px' }}
            />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
