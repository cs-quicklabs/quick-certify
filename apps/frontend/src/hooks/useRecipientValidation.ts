'use client';

import { useState, useCallback } from 'react';
import {
  recipientRowSchema,
  issueCredentialStep1Schema,
  type RecipientRow,
} from '@/schemas/credential.schema';

export function useRecipientValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateRecipient = useCallback((recipient: RecipientRow) => {
    return recipientRowSchema.safeParse(recipient).success;
  }, []);

  const validateAll = useCallback(
    (eventId: string, recipients: RecipientRow[]): boolean => {
      const newErrors: Record<string, string> = {};

      if (!eventId) {
        newErrors.eventId = 'Please select an event';
      }

      recipients.forEach((r) => {
        const result = recipientRowSchema.safeParse(r);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            newErrors[`${r.id}-${field}`] = issue.message;
          });
        }
      });

      // Check for duplicate emails
      const emailSet = new Set<string>();
      recipients.forEach((r) => {
        if (r.email) {
          const lower = r.email.toLowerCase();
          if (emailSet.has(lower)) {
            newErrors[`${r.id}-email`] = 'Duplicate email address';
          }
          emailSet.add(lower);
        }
      });

      // Check overall step1 validation
      const step1Result = issueCredentialStep1Schema.safeParse({ eventId, recipients });
      if (!step1Result.success && !newErrors.eventId) {
        step1Result.error.issues.forEach((issue) => {
          if (issue.path[0] === 'eventId') {
            newErrors.eventId = issue.message;
          }
        });
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [],
  );

  const clearFieldError = useCallback((key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return { errors, validateRecipient, validateAll, clearFieldError };
}
