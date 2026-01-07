import { Sequelize } from 'sequelize';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file if it exists (optional)
// In production, environment variables are typically set directly in the environment
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log('ℹ️  No .env file found, using environment variables from system');
}

interface MigrationModule {
  up: (
    queryInterface: ReturnType<Sequelize['getQueryInterface']>,
    sequelize: typeof Sequelize,
  ) => Promise<void>;
  down: (
    queryInterface: ReturnType<Sequelize['getQueryInterface']>,
    sequelize: typeof Sequelize,
  ) => Promise<void>;
}

/**
 * Migration Runner
 *
 * Runs database migrations using Sequelize
 * Usage: npx ts-node src/database/run-migrations.ts [up|down|status]
 */
class MigrationRunner {
  private sequelize: Sequelize;
  private migrationsTable = 'sequelize_migrations';
  private migrationsPath: string;
  private seedersPath: string;

  constructor() {
    this.sequelize = new Sequelize({
      dialect: (process.env.DATABASE_TYPE as 'postgres') || 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      logging: process.env.DATABASE_LOG === 'true' ? console.log : false,
    });

    this.migrationsPath = path.join(__dirname, 'migrations');
    this.seedersPath = path.join(__dirname, 'seeders');
  }

  private async ensureMigrationTable(): Promise<void> {
    await this.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "${this.migrationsTable}" (
        "name" VARCHAR(255) PRIMARY KEY,
        "executed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async getExecutedMigrations(): Promise<string[]> {
    const [results] = await this.sequelize.query(
      `SELECT name FROM "${this.migrationsTable}" ORDER BY name`,
    );
    return (results as { name: string }[]).map((r) => r.name);
  }

  private getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }
    return fs
      .readdirSync(this.migrationsPath)
      .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
      .sort();
  }

  private getSeederFiles(): string[] {
    if (!fs.existsSync(this.seedersPath)) {
      return [];
    }
    return fs
      .readdirSync(this.seedersPath)
      .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
      .sort();
  }

  async runMigrations(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Database connection established');

      await this.ensureMigrationTable();

      const executed = await this.getExecutedMigrations();
      const files = this.getMigrationFiles();
      const pending = files.filter((f) => !executed.includes(f));

      if (pending.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }

      console.log(`📦 Running ${pending.length} pending migration(s)...\n`);

      for (const file of pending) {
        console.log(`⏳ Running: ${file}`);
        const migration: MigrationModule = require(path.join(this.migrationsPath, file));

        await migration.up(this.sequelize.getQueryInterface(), Sequelize);

        await this.sequelize.query(`INSERT INTO "${this.migrationsTable}" (name) VALUES (:name)`, {
          replacements: { name: file },
        });

        console.log(`✅ Completed: ${file}\n`);
      }

      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async rollbackMigration(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Database connection established');

      await this.ensureMigrationTable();

      const executed = await this.getExecutedMigrations();

      if (executed.length === 0) {
        console.log('ℹ️ No migrations to rollback');
        return;
      }

      const lastMigration = executed[executed.length - 1];
      console.log(`⏳ Rolling back: ${lastMigration}`);

      const migration: MigrationModule = require(path.join(this.migrationsPath, lastMigration));
      await migration.down(this.sequelize.getQueryInterface(), Sequelize);

      await this.sequelize.query(`DELETE FROM "${this.migrationsTable}" WHERE name = :name`, {
        replacements: { name: lastMigration },
      });

      console.log(`✅ Rolled back: ${lastMigration}`);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  async runSeeders(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Database connection established');

      const files = this.getSeederFiles();

      if (files.length === 0) {
        console.log('ℹ️ No seeders found');
        return;
      }

      console.log(`🌱 Running ${files.length} seeder(s)...\n`);

      for (const file of files) {
        console.log(`⏳ Seeding: ${file}`);
        const seeder: MigrationModule = require(path.join(this.seedersPath, file));

        await seeder.up(this.sequelize.getQueryInterface(), Sequelize);

        console.log(`✅ Completed: ${file}\n`);
      }

      console.log('✅ All seeders completed successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  async showStatus(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      await this.ensureMigrationTable();

      const executed = await this.getExecutedMigrations();
      const files = this.getMigrationFiles();

      console.log('\n📊 Migration Status:\n');
      console.log('─'.repeat(60));

      for (const file of files) {
        const status = executed.includes(file) ? '✅ Executed' : '⏳ Pending';
        console.log(`${status}  ${file}`);
      }

      console.log('─'.repeat(60));
      console.log(
        `\nTotal: ${files.length} | Executed: ${executed.length} | Pending: ${
          files.length - executed.length
        }`,
      );
    } catch (error) {
      console.error('❌ Failed to get status:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.sequelize.close();
  }
}

// CLI Runner
async function main() {
  const command = process.argv[2] || 'up';
  const runner = new MigrationRunner();

  try {
    switch (command) {
      case 'up':
        await runner.runMigrations();
        break;
      case 'down':
        await runner.rollbackMigration();
        break;
      case 'seed':
        await runner.runSeeders();
        break;
      case 'status':
        await runner.showStatus();
        break;
      case 'fresh': {
        // Drop all tables and re-run migrations
        console.log('⚠️  Fresh migration will drop all tables!\n');
        await runner.showStatus();
        // Rollback all migrations first
        let hasMore = true;
        while (hasMore) {
          try {
            await runner.rollbackMigration();
          } catch {
            hasMore = false;
          }
        }
        // Then run all migrations
        await runner.runMigrations();
        await runner.runSeeders();
        break;
      }
      default:
        console.log(
          'Usage: npx ts-node src/database/run-migrations.ts [up|down|seed|status|fresh]',
        );
        console.log('\nCommands:');
        console.log('  up      Run pending migrations');
        console.log('  down    Rollback last migration');
        console.log('  seed    Run all seeders');
        console.log('  status  Show migration status');
        console.log('  fresh   Drop all tables and re-run (WARNING: destroys data)');
        process.exit(1);
    }
  } finally {
    await runner.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
