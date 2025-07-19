import { z } from "zod";
import type {
    Integer,
    Iso8601DateTime,
    NonEmptyString,
    Uuid,
} from "../typeDefinitions";
import { errResult, okResult, type Result } from "./errorHandling";
import { zodIso8601DateTime, zodUuid } from "./validationPatterns";

export function getIso8601DateTimeFromUnknown(
    input: unknown
): Result<Iso8601DateTime> {
    try {
        zodIso8601DateTime.parse(input);
    } catch (error_: unknown) {
        const error = getErrorFromUnknown(error_);
        return errResult(error);
    }

    return okResult(input as Iso8601DateTime);
}

export function getUuidFromUnknown(input: unknown): Result<Uuid> {
    try {
        zodUuid.parse(input);
    } catch (error_: unknown) {
        const error = getErrorFromUnknown(error_);
        return errResult(error);
    }

    return okResult(input as Uuid);
}

export function getEnumValueFromUnknown<T>(
    input: unknown,
    // TODO: Figure out type
    enumObject: Record<string | symbol | number, T>
): Result<T> {
    if (Object.values(enumObject).includes(input as T)) {
        return okResult(input as T);
    }

    return errResult(new Error(`Invalid enum value ${input}`));
}

export function getStringFromUnknown(input: unknown): Result<string> {
    // TODO: Replace with zod
    if (typeof input !== "string") {
        return errResult(
            new Error(`${input} of type ${typeof input} is not a valid string`)
        );
    }

    return okResult(input);
}

export function getRequiredEnvironmentVariable(variable: string): string {
    const value = process.env[variable];
    if (value == null) {
        throw new Error(`Required environment variable ${variable} not found!`);
    }
    return value;
}

export function getNonEmptyStringFromUnknown(
    input: unknown
): Result<NonEmptyString> {
    // TODO: Replace with zod
    if (typeof input !== "string" || input.length === 0) {
        return errResult(
            new Error(
                `${input} of type ${typeof input} is not a valid NonEmptyString`
            )
        );
    }

    return okResult(input as NonEmptyString);
}

// Trims the string, converts empty strings (len = 0) to null
export function getSanitizedStringFromUnknown(
    input: unknown
): Result<NonEmptyString> {
    // TODO: Replace with zod
    if (typeof input !== "string" || input.trim().length === 0) {
        return errResult(
            new Error(
                `${input} of type ${typeof input} is not a valid SanitizedString`
            )
        );
    }

    return okResult(input.trim() as NonEmptyString);
}

// TODO: Accept a number or string, and parse accordingly
export function getIntegerFromUnknown(input: unknown): Result<Integer> {
    // TODO: Replace with zod
    if (typeof input !== "string" || input.length === 0) {
        return errResult(
            new Error(`${input} of type ${typeof input} is not a valid Integer`)
        );
    }

    const int = parseInt(input);

    if (isNaN(int)) {
        return errResult(
            new Error(`${input} of type ${typeof input} is not a valid Integer`)
        );
    }

    return okResult(int);
}

// TODO: Accept a number or string, and parse accordingly
export function getNumberFromUnknown(input: unknown): Result<number> {
    if (typeof input === "number") {
        return okResult(input);
    }

    // TODO: Replace with zod
    if (typeof input !== "string" || input.length === 0) {
        return errResult(
            new Error(`${input} of type ${typeof input} is not a valid number`)
        );
    }

    const number = parseFloat(input);

    if (isNaN(number)) {
        return errResult(
            new Error(`${input} of type ${typeof input} is not a valid number`)
        );
    }

    return okResult(number);
}

export function getErrorFromUnknown(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error(String(error));
}

export function getObjectFromUnknown(input: unknown): Result<unknown> {
    // TODO: Replace with zod
    if (typeof input !== "string" || input.length === 0) {
        return errResult(
            new Error(`${input} of type ${typeof input} is not a valid JSON`)
        );
    }

    let obj: unknown;
    try {
        obj = JSON.parse(input);
    } catch (error_: unknown) {
        const error = getErrorFromUnknown(error_);
        return errResult(error);
    }

    return okResult(obj);
}

// TODO: Accept a boolean or string, and parse accordingly
export function getBooleanFromUnknown(input: unknown): Result<boolean> {
    const validateBoolean = z.boolean().or(
        z
            .string()
            .toLowerCase()
            .transform((x) => x === "true")
            .pipe(z.boolean())
    );

    let parsedInput: boolean;
    try {
        parsedInput = validateBoolean.parse(input);
    } catch (error_: unknown) {
        const error = getErrorFromUnknown(error_);
        return errResult(error);
    }

    return okResult(parsedInput);
}

export function getFileFromUnknown(input: unknown): Result<File> {
    if (!(input instanceof File)) {
        return errResult(
            new Error(`${input} of type ${typeof input} is not a valid file`)
        );
    }

    return okResult(input);
}
