export function getFormDataRequestInLoggableForm(request: Request, formData: FormData, errorCode: string, error?: string): string {
    return JSON.stringify({
        errorCode: errorCode,
        error: error,
        url: request.url,
        headers: getRequestHeadersAsArray(request),
        body: getRequestFormDataAsArray(formData),
    });
}

export function getJsonRequestInLoggableForm(request: Request, bodyJson: unknown, errorCode: string, error?: string): string {
    return JSON.stringify({
        errorCode: errorCode,
        error: error,
        url: request.url,
        headers: getRequestHeadersAsArray(request),
        body: bodyJson,
    });
}

export function getTextRequestInLoggableForm(request: Request, bodyText: unknown, errorCode: string, error?: string): string {
    return JSON.stringify({
        errorCode: errorCode,
        error: error,
        url: request.url,
        headers: getRequestHeadersAsArray(request),
        body: bodyText,
    });
}

export function getRequestHeadersAsArray(request: Request): Array<[string, string]> {
    const headers: Array<[string, string]> = [];

    for (const kvp of request.headers.entries()) {
        headers.push(kvp);
    }

    return headers;
}

export function getRequestFormDataAsArray(formData: FormData): Array<[string, string]> {
    const body: Array<[string, string]> = [];

    for (const [k, v] of formData.entries()) {
        body.push([k, JSON.stringify(v)]);
    }

    return body;
}
