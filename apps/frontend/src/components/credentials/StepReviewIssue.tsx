'use client';

import { IssueCredentialView, type IssueMode } from './IssueCredentialView';
import { CredentialDetailView, type DetailMode } from './CredentialDetailView';

type StepReviewIssueProps = IssueMode | DetailMode;

export function StepReviewIssue(props: StepReviewIssueProps) {
  if (props.mode === 'issue') {
    return <IssueCredentialView {...props} />;
  }
  return <CredentialDetailView {...props} />;
}
