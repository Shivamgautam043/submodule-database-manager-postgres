export type OkResult<T> = {
    success: true;
    data: T;
};

export type ErrResult<T> = {
    success: false;
    err: Error;
};

export type Result<T> = OkResult<T> | ErrResult<T>;

export function emptyOkResult(): OkResult<void> {
    return okResult<void>(undefined);
}

export function okResult<T>(data: T): OkResult<T> {
    return {
        success: true,
        data: data,
    };
}

export function errResult<T>(err: Error): ErrResult<T> {
    return {
        success: false,
        err: err,
    };
}

export function unwrap<T>(result: Result<T>, debuggingId: string): T {
    if (result.success === false) {
        throw new Error(`${result.err.message}; ${debuggingId}`);
    }

    return result.data;
}
