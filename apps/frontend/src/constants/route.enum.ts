export enum RouteEnum {
  LOGIN = '/',
  RESET_PASSWORD = '/reset-password',
  FORGOT_PASSWORD = '/forgot-password',
  DASHBOARD = '/dashboard',
  PROFILE_SETTINGS = '/dashboard/profile-settings',
  EVENT_SETTINGS = '/dashboard/event-settings',
  ACCOUNT_SETTINGS = '/dashboard/account-settings',
  TEAM = '/dashboard/team',
}

export enum authApiEnum {
  LOGIN = '/auth/login',
  FORGOT_PASSWORD = '/users/forgot-password',
  RESET_PASSWORD = '/users/reset-password',
  LOGOUT = '/auth/logout',
  GET_USER = '/users/profile',
  REFRESH_TOKEN = '/users/refresh',
}

export enum FileApiEnum {
  UPLOAD = '/file/upload',
}
