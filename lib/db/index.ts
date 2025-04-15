import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/lib/db/schema';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Ensure DATABASE_URL is a string
const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Connection pool configuration
const connectionOptions = {
  ssl: 'require' as const,
  max: 10, // Increase max connections for better concurrency
  min: 2,  // Minimum connections to maintain
  idle_timeout: 30, // Increased idle timeout
  connect_timeout: 15,
  prepare: false,
  keepAlive: true,
  connection: {
    application_name: 'Ligaye.com'
  }
} as const;

let _db: PostgresJsDatabase<typeof schema>;
let _client: postgres.Sql;

function getDb() {
  if (!_db) {
    console.log('Initializing new database connection...');
    try {
      _client = postgres(DATABASE_URL, connectionOptions);
      
      // Initialize drizzle with the pg client and schema
      _db = drizzle(_client, { schema });
      
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }
  return _db;
}

// Graceful shutdown handler
async function closeConnection() {
  if (_client) {
    console.log('Closing database connection...');
    try {
      await _client.end();
      _db = undefined as any;
      _client = undefined as any;
      console.log('Database connection closed successfully');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}

// Handle process termination
process.on('SIGTERM', closeConnection);
process.on('SIGINT', closeConnection);

// Export a function that returns the db instance
export function db() {
  return getDb();
}

// Export the close connection function for testing/cleanup
export { closeConnection };