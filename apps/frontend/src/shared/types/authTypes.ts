export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  organizationWebsite: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
