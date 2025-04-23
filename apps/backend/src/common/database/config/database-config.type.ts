export type DatabaseConfig = {
  dialect: string;
  host: string;
  port: number;
  password: string;
  database: string;
  username?: string;
  logging: boolean;
  synchronize?: boolean;
  maxConnections: number;
  sslEnabled?: boolean;
};
