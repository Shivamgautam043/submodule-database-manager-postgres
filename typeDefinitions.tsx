export type Uuid = string & {__brand: "Uuid"};

export type NonEmptyString = string & {__brand: "NonEmptyString"};

export type Iso8601DateTime = string & {__brand: "Iso8601DateTime"};
export type Iso8601Date = string & {__brand: "Iso8601Date"};
export type Iso8601Time = string & {__brand: "Iso8601Time"};

export type JwtString = string & {__brand: "JwtString"};

export type Integer = number;
export type RealNumber = number;

// Hex color code of the form `#xxxxxx`
export type ColorHexCodeNormalized = string;
export type BlurHash = string;

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export type Serialized<T> = {
    [P in keyof T]: string;
};
