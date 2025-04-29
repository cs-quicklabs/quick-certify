export enum RouteEnum {
  LOGIN = '/',
  RESET_PASSWORD = '/reset-password',
  FORGOT_PASSWORD = '/forgot-password',
  DASHBOARD = '/dashboard',
}

export enum authApiEnum {
  LOGIN = '/users/login',
  FORGOT_PASSWORD = '/users/forgot-password',
  RESET_PASSWORD = '/users/reset-password',
  LOGOUT = '/users/logout',
  GET_USER = '/users/profile',
  REFRESH_TOKEN = '/users/refresh',
}

export enum FileApiEnum {
  UPLOAD = '/file/upload',
}
