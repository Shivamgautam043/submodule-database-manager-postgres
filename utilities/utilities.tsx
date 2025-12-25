import { v4 as uuidv4 } from "uuid";
import { Iso8601DateTime, Uuid } from "../typeDefinitions";
// import type {Iso8601DateTime, Uuid} from "~/submodule-common-type-definitions/typeDefinitions";

export function coalesce(
    ...args: Array<string | null | undefined>
): string | null {
    for (let i = 0; i < args.length; i++) {
        if (args[i] != null) {
            // @ts-ignore
            return args[i];
        }
    }

    return null;
}

export function kvpListToObject<T>(kvpList: Array<[string, T]>): {
    [attribute: string]: T;
} {
    return kvpList.reduce(
        (aggregate, kvp) => ({
            ...aggregate,
            [kvp[0]]: kvp[1],
        }),
        {}
    );
}

export function distinct<T>(arr: Array<T>): Array<T> {
    function onlyUnique(value: T, index: number, self: Array<T>) {
        return self.indexOf(value) === index;
    }

    return arr.filter(onlyUnique);
}

export function generateUuid(): Uuid {
    return uuidv4() as Uuid;
}

export function getUnixTimeInSeconds(): number {
    return Math.trunc(Date.now() / 1000);
}

export function getCurrentIsoTimestamp(): Iso8601DateTime {
    return new Date().toISOString() as Iso8601DateTime;
}

export async function delay(ms: number) {
    await new Promise((_) => setTimeout(_, ms));
}

export function getIntegerArrayOfLength(n: number) {
    return Array(n)
        .fill(null)
        .map((_, i) => i);
}

export function convertArrayToUint8Array(arr: Array<number>): Int8Array {
    const arrInt8 = new Int8Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        arrInt8[i] = arr[i];
    }
    return arrInt8;
}

export function deterministicShuffle<T>(
    array: Array<T>,
    seed: number
): Array<T> {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    seed = seed || 1;

    const seededRandom = function () {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(seededRandom() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export function assert(condition: boolean, error: string): void {
    if (condition === false) {
        throw new Error(error);
    }
}

export function getNonNullValue<T>(input: T, error: string): NonNullable<T> {
    if (input === undefined || input === null) {
        throw new Error(`Expected a non-null value: ${input}; ${error}`);
    }

    return input;
}

export function getSingletonValue<T>(arr: Array<T>, error: string): T {
    if (arr === undefined || arr === null || arr.length == 0) {
        throw new Error(
            `Zero values received, when one and only one was expected: ${JSON.stringify(
                arr
            )}; ${error}`
        );
    }

    if (arr.length > 1) {
        throw new Error(
            `More than one value received, when one and only one was expected: ${JSON.stringify(
                arr
            )}; ${error}`
        );
    }

    return arr[0];
}

export function getSingletonValueOrNull<T>(
    arr: Array<T>,
    error: string
): T | null {
    if (arr === undefined || arr === null || arr.length == 0) {
        return null;
    }

    if (arr.length > 1) {
        throw new Error(
            `More than one value received, when one and only one was expected: ${JSON.stringify(
                arr
            )}; ${error}`
        );
    }

    return arr[0];
}

// Time utilities
export function getHumanReadableMonth(monthIndex: number): string {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return months[monthIndex];
}

export function getHumanReadableShortMonth(monthIndex: number): string {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];
    return months[monthIndex];
}

export function getHumanReadableShortDay(day: number): string {
    return day == 0
        ? "Sun"
        : day == 1
        ? "Mon"
        : day == 2
        ? "Tue"
        : day == 3
        ? "Wed"
        : day == 4
        ? "Thu"
        : day == 5
        ? "Fri"
        : day == 6
        ? "Sat"
        : "";
}

export function getHumanReadable12HourString(
    hours: number,
    minutes: number
): string {
    let hours2 = hours % 12;
    hours2 = hours2 ? hours2 : 12; // the hour `0` should be `12`
    const minutes2 = minutes < 10 ? "0" + minutes : minutes;
    const strTime = hours2 + ":" + minutes2 + " " + (hours >= 12 ? "PM" : "AM");
    return strTime;
}

// export function getUnixTimeInSecondsFromDateTime(dateTime: DateTime) {
//     return Math.trunc(dateTime.toMillis() / 1000);
// }

// export function getUnixTimeInSecondsFromString(date: string): number {
//     return Math.trunc(new Date(date).getMilliseconds() / 1000);
// }
