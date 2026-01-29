import { Injectable } from '@nestjs/common';

/**
 * Simple Database Query Logger for NestJS + Sequelize
 * No external dependencies required
 */
@Injectable()
export class SimpleQueryLogger {
  constructor(
    private readonly options: {
      formatQueries?: boolean;
      logExecutionTime?: boolean;
      slowQueryThreshold?: number;
      colorize?: boolean;
      simplifyQuery?: boolean;
    } = {},
  ) {
    this.options = {
      formatQueries: options.formatQueries ?? true,
      logExecutionTime: options.logExecutionTime ?? true,
      slowQueryThreshold: options.slowQueryThreshold ?? 1000,
      colorize: options.colorize ?? true,
      simplifyQuery: options.simplifyQuery ?? true,
    };
  }

  /**
   * Log SQL query
   */
  log(sql: string, executionTime?: number | string): void {
    const queryType = this.getQueryType(sql);
    let processedSql = sql;

    // Simplify query if enabled
    if (this.options.simplifyQuery) {
      processedSql = this.simplifyQuery(processedSql);
    }

    // Format query if enabled
    const formattedSql = this.options.formatQueries ? this.formatQuery(processedSql) : processedSql;

    let logMessage = `[${queryType}]`;

    if (this.options.logExecutionTime && executionTime !== undefined && executionTime !== null) {
      // Convert to number if it's a string
      const timeInMs =
        typeof executionTime === 'string' ? parseFloat(executionTime) : executionTime;

      // Only proceed if we have a valid number
      if (!isNaN(timeInMs)) {
        const isSlow = timeInMs > (this.options.slowQueryThreshold || 1000);
        const timeColor = isSlow ? '🔴' : timeInMs > 500 ? '🟡' : '🟢';
        logMessage += ` ${timeColor} ${timeInMs.toFixed(2)}ms`;

        if (isSlow) {
          console.warn(this.createLogMessage(logMessage, formattedSql));
          return;
        }
      }
    }

    console.log(this.createLogMessage(logMessage, formattedSql));
  }

  private createLogMessage(message: string, formattedSql: string): string {
    return `\n${message} - ${formattedSql}`;
  }

  /**
   * Get query type
   */
  private getQueryType(sql: string): string {
    const normalized = sql.trim().toUpperCase();

    if (normalized.startsWith('SELECT')) return 'SELECT';
    if (normalized.startsWith('INSERT')) return 'INSERT';
    if (normalized.startsWith('UPDATE')) return 'UPDATE';
    if (normalized.startsWith('DELETE')) return 'DELETE';
    if (normalized.startsWith('CREATE')) return 'CREATE';
    if (normalized.startsWith('DROP')) return 'DROP';
    if (normalized.startsWith('ALTER')) return 'ALTER';

    return 'QUERY';
  }

  /**
   * Simplify query by removing verbose Sequelize patterns
   */
  private simplifyQuery(sql: string): string {
    let simplified = sql;

    // Step 1: Build a map of aliases to table names
    const aliasMap = new Map<string, string>();
    const aliasPattern = /(?:FROM|JOIN)\s+"(\w+)"\s+AS\s+"(\w+)"/gi;
    let match;

    while ((match = aliasPattern.exec(sql)) !== null) {
      const tableName = match[1];
      const aliasName = match[2];
      aliasMap.set(aliasName, tableName);
    }

    // Step 2: Simplify column selections
    // Replace "TableEntity"."column" AS "column" with just column
    simplified = simplified.replace(/"(\w+Entity)"\."\w+"\s+AS\s+"(\w+)"/g, '$2');

    // Replace "table"."column" AS "table.column" with just column (for joined tables)
    simplified = simplified.replace(/"(\w+)"\."\w+"\s+AS\s+"\w+\.\w+"/g, (match) => {
      // Extract just the column name from the AS clause
      const asMatch = match.match(/AS\s+"(\w+)\.(\w+)"/);
      if (asMatch) {
        return asMatch[2]; // Return just the column name
      }
      return match;
    });

    // Step 3: Replace remaining table alias references
    aliasMap.forEach((tableName, aliasName) => {
      // Replace "AliasName"."column" with just column for main entity
      if (aliasName.includes('Entity')) {
        const pattern = new RegExp(`"${aliasName}"\\."(\\w+)"`, 'g');
        simplified = simplified.replace(pattern, '$1');
      } else {
        // For joined tables, keep table.column format
        const pattern = new RegExp(`"${aliasName}"\\."(\\w+)"`, 'g');
        simplified = simplified.replace(pattern, `${tableName}.$1`);
      }
    });

    // Step 4: Clean up AS clauses in FROM and JOIN
    simplified = simplified.replace(/\s+AS\s+"[^"]+Entity"/gi, '');
    simplified = simplified.replace(/\s+AS\s+"(\w+)"/gi, (match, alias) => {
      // Keep the alias for joined tables
      const tableName = aliasMap.get(alias);
      return tableName && !alias.includes('Entity') ? ` AS ${alias}` : '';
    });

    // Step 5: Remove all remaining quotes
    simplified = simplified.replace(/"/g, '');

    // Step 6: Clean up extra spaces
    simplified = simplified.replace(/\s+/g, ' ').trim();

    return simplified;
  }

  /**
   * Format SQL query without external dependencies
   */
  private formatQuery(sql: string): string {
    // Remove extra whitespace
    let formatted = sql.replace(/\s+/g, ' ').trim();

    // Add line breaks for better readability
    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'JOIN',
      'LEFT JOIN',
      'RIGHT JOIN',
      'INNER JOIN',
      'LEFT OUTER JOIN',
      'RIGHT OUTER JOIN',
      'ORDER BY',
      'GROUP BY',
      'HAVING',
      'LIMIT',
      'OFFSET',
      'INSERT INTO',
      'UPDATE',
      'DELETE FROM',
      'SET',
      'VALUES',
      'ON',
      'AND',
      'OR',
    ];

    // Sort by length (longest first) to avoid partial matches
    keywords.sort((a, b) => b.length - a.length);

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');

      if (['AND', 'OR'].includes(keyword)) {
        formatted = formatted.replace(regex, `${keyword.toUpperCase()}`);
      } else if (keyword === 'ON') {
        formatted = formatted.replace(regex, `${keyword.toUpperCase()}`);
      } else {
        formatted = formatted.replace(regex, `${keyword.toUpperCase()}`);
      }
    }

    // Replace createdAt and updatedAt with created_at and updated_at
    formatted = formatted.replace(/\bcreatedAt\b/gi, 'created_at');
    formatted = formatted.replace(/\bupdatedAt\b/gi, 'updated_at');

    return formatted.trim();
  }
}

/**
 * Factory function to create logging function for Sequelize config
 * Note: Sequelize sometimes passes timing as a string, so we handle both number and string types
 */
export function createSequelizeLogger(options?: {
  formatQueries?: boolean;
  logExecutionTime?: boolean;
  slowQueryThreshold?: number;
  colorize?: boolean;
  simplifyQuery?: boolean;
}) {
  const queryLogger = new SimpleQueryLogger(options);

  return (sql: string, timing?: number | string) => {
    // removing Executed (default): from the query
    sql = sql.replace(/Executed \(default\):\s*/, '');

    queryLogger.log(sql, timing);
  };
}
