import type { QueryResult } from "pg";
import { Pool } from "pg";
import { Result, okResult, errResult } from "./utilities/errorHandling";
import { Uuid } from "./typeDefinitions";

// Declares global variables to ensure the PostgresDatabaseManager behaves as a singleton
declare global {
    var _postgresDatabaseManagers:
        | Map<Uuid | null, PostgresDatabaseManager>
        | undefined; // Stores a map of database managers (one per ID)
    var _postgresDatabaseCredentialsResolver:
        | ((id: Uuid | null) => Promise<Result<PostgresDatabaseCredentials>>)
        | undefined; // A function to resolve database credentials based on an ID
}

// Defines the structure for Postgres database credentials
export type PostgresDatabaseCredentials = {
    DB_HOST: string; // Database host (e.g., localhost or IP)
    DB_PORT: number; // Port number (default is 5432)
    DB_NAME: string; // Name of the database
    DB_USERNAME: string; // Username to connect
    DB_PASSWORD: string; // Password for authentication
    DB_SSL: {
        rejectUnauthorized: boolean; // SSL option to allow self-signed certificates
    };
};

// A class to manage Postgres database connections and queries
export class PostgresDatabaseManager {
    private pool: Pool; // Instance of the pg Pool to manage database connections

    // Constructor initializes the Pool instance with the provided credentials
    constructor(credentials: PostgresDatabaseCredentials) {
        this.pool = new Pool({
            host: credentials.DB_HOST,
            port: credentials.DB_PORT,
            database: credentials.DB_NAME,
            user: credentials.DB_USERNAME,
            password: credentials.DB_PASSWORD,
            ssl: {
                rejectUnauthorized: false,
            },
        });
    }

    // Executes a query and returns the result wrapped in a custom Result type
    async execute(
        query: string,
        params?: Array<unknown>
    ): Promise<Result<QueryResult<unknown>>> {
        try {
            const result = await this.pool.query(query, params); // Execute query with optional parameters
            return okResult(result as QueryResult<unknown>); // Wrap query result rows in a success response
        } catch (error) {
            return errResult(error as Error); // Wrap errors in a failure response
        }
    }

    // Closes all database connections in the pool
    async close(): Promise<void> {
        await this.pool.end();
    }
}

// Function to retrieve a singleton instance of PostgresDatabaseManager
export async function getPostgresDatabaseManager(
    id: Uuid | null
): Promise<Result<PostgresDatabaseManager>> {
    if (!global._postgresDatabaseManagers) {
        global._postgresDatabaseManagers = new Map(); // Initialize global map for managers
    }

    // If the manager for the given ID does not exist, create one
    if (!global._postgresDatabaseManagers.has(id)) {
        if (!global._postgresDatabaseCredentialsResolver) {
            console.log("Database credentials resolver not set.");
            return errResult(Error("Database credentials resolver not set."));
        }

        // Resolve credentials using the global resolver
        const credentialsResult =
            await global._postgresDatabaseCredentialsResolver(id);
        if (!credentialsResult.success) {
            return credentialsResult; // Return error if credentials couldn't be resolved
        }

        // Create a new manager and store it in the global map
        const databaseManager = new PostgresDatabaseManager(
            credentialsResult.data
        );
        global._postgresDatabaseManagers.set(id, databaseManager);
    }

    // Return the existing or newly created database manager
    const dbManager = global._postgresDatabaseManagers.get(id)!;
    return okResult(dbManager);
}

// Function to set the global credentials resolver
export function setDatabaseCredentialsResolver(
    resolver: (id: Uuid | null) => Promise<Result<PostgresDatabaseCredentials>>
): void {
    global._postgresDatabaseCredentialsResolver = resolver;
}

// Setting up the global resolver to fetch credentials from environment variables
setDatabaseCredentialsResolver(async () => {
    const credentials = {
        DB_HOST: process.env.DB_HOST || "",
        DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
        DB_NAME: process.env.DB_NAME || "",
        DB_USERNAME: process.env.DB_USERNAME || "",
        DB_PASSWORD: process.env.DB_PASSWORD || "",
        DB_SSL: {
            rejectUnauthorized: false, // Allow insecure SSL by default
        },
    };

    return okResult(credentials); // Wrap the credentials in a success response
});

/**
 * Stepwise Explanation of the Database Connection Process:
 *
 * 1. Global Initialization:
 *    - Two global variables are declared:
 *      - `_postgresDatabaseManagers`: A map that stores instances of `PostgresDatabaseManager` for reuse (singleton behavior).
 *      - `_postgresDatabaseCredentialsResolver`: A function to resolve database credentials based on an identifier.
 *
 * 2. Setting up the Credentials Resolver:
 *    - A function is assigned to `_postgresDatabaseCredentialsResolver` that reads environment variables (`process.env`) to construct the credentials required to connect to the database.
 *    - SSL settings are included to allow connections even if the SSL certificate is not trusted.
 *
 * 3. Requesting a Database Manager:
 *    - When `getPostgresDatabaseManager` is called with an ID:
 *      - It checks if a manager for that ID already exists in `_postgresDatabaseManagers`.
 *      - If not, it uses the credentials resolver to fetch database credentials.
 *      - A new instance of `PostgresDatabaseManager` is created using the resolved credentials and stored in the global map.
 *
 * 4. Connecting to the Database:
 *    - `PostgresDatabaseManager` initializes a `Pool` instance from the `pg` library with the provided credentials.
 *    - The pool manages connections to the database, handling creation, reuse, and cleanup of connections.
 *
 * 5. Executing Queries:
 *    - The `execute` method of `PostgresDatabaseManager` is used to run SQL queries.
 *    - It accepts a query string and optional parameters, executes the query using the pool, and returns the result wrapped in a `Result` object.
 *    - Errors during query execution are also wrapped in a `Result` object for consistent error handling.
 *
 * 6. Closing Connections:
 *    - When `close` is called, all connections managed by the pool are closed to free up resources.
 */
