import type { QueryResult } from "pg";
import pg from "pg";
import { Result, errResult, okResult } from "./utilities/errorHandling";
import { getErrorFromUnknown } from "./utilities/typeValidationUtilities";
import { Uuid } from "./typeDefinitions";
const { Pool } = pg;

declare global {
    // eslint-disable-next-line no-var
    var _postgresDatabaseCredentialsResolver:
        | ((id: Uuid | null) => Promise<Result<PostgresDatabaseCredentials>>)
        | undefined;
    // eslint-disable-next-line no-var
    var _postgresDatabaseManagers:
        | Map<Uuid | null, PostgresDatabaseManager>
        | undefined;
}

export type PostgresDatabaseCredentials = {
    DB_HOST: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_SSL: boolean;
};

export class PostgresDatabaseManager {
    databaseConnectionPool: pg.Pool;

    constructor(databaseConnectionPool: pg.Pool) {
        this.databaseConnectionPool = databaseConnectionPool;
    }

    // TODO: Rename to something better
    async execute(
        query: string,
        queryArguments?: Array<unknown>
    ): Promise<
        Result<
            // @ts-ignore
            QueryResult<unknown>
        >
    > {
        try {
            const response = await this.databaseConnectionPool.query(
                query,
                queryArguments
            );
            return okResult(
                // @ts-ignore
                response as QueryResult<unknown>
            );
        } catch (error_: unknown) {
            const error = getErrorFromUnknown(error_);
            // logBackendError(error);
            return errResult(error);
        }
    }
}

export async function getPostgresDatabaseManager(
    id: Uuid | null
): Promise<Result<PostgresDatabaseManager>> {
    if (global._postgresDatabaseManagers === undefined) {
        global._postgresDatabaseManagers = new Map<
            Uuid,
            PostgresDatabaseManager
        >();
    }
    if (!global._postgresDatabaseManagers.has(id)) {
        if (global._postgresDatabaseCredentialsResolver === undefined) {
            return errResult(Error("edc6b564-0c19-43d6-ad07-74601e74f4c2"));
        }

        const postgresDatabaseCredentials =
            await global._postgresDatabaseCredentialsResolver(id);

        if (postgresDatabaseCredentials.success === false) {
            return postgresDatabaseCredentials;
        }

        const databaseConnectionPool = getNewDatabaseConnectionPool(
            postgresDatabaseCredentials.ok
        );

        global._postgresDatabaseManagers.set(
            id,
            new PostgresDatabaseManager(databaseConnectionPool)
        );
    }

    const postgresDatabaseManager = global._postgresDatabaseManagers.get(id)!;
    // TODO: Ensure the connection is valid and alive

    return okResult(postgresDatabaseManager);
}

// TODO: Do some error handling here, and return a Promise<Result<pg.Pool>> instead?
function getNewDatabaseConnectionPool(
    credentials: PostgresDatabaseCredentials
): pg.Pool {
    const databaseConnectionPool = new Pool({
        host: credentials.DB_HOST,
        port: credentials.DB_PORT,
        database: credentials.DB_NAME,
        user: credentials.DB_USERNAME,
        password: credentials.DB_PASSWORD,
        ssl: credentials.DB_SSL,
    });

    return databaseConnectionPool;
}
