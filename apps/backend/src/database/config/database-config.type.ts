export type DatabaseConfig = {
  dialect: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
  synchronize: boolean;
};
