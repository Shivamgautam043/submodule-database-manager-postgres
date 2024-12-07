import {z as zod} from "zod";

export const emailIdValidationPattern = "^.+@.+\\..+$";
export const emailIdValidationRegex = new RegExp(emailIdValidationPattern);

export const nameValidationPattern = "^[a-zA-Z. ]+$";
export const nameValidationRegex = new RegExp(nameValidationPattern);

export const phoneNumberValidationPattern = "^[6-9][0-9]{9}$";
export const phoneNumberValidationRegex = new RegExp(phoneNumberValidationPattern);
export const indianPhoneNumberValidationPattern = "^[6-9]{1}[0-9]{9}$";
export const indianPhoneNumberValidationRegex = new RegExp(indianPhoneNumberValidationPattern);
export const pinCodeValidationPattern = "^[1-9]{1}[0-9]{5}$";
export const pinCodeValidationRegex = new RegExp(pinCodeValidationPattern);

export const websiteValidationPattern = "^.+\\..+$";
export const websiteValidationRegex = new RegExp(websiteValidationPattern);

export const uuidValidationPattern =
    "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$";
export const zodUuid = zod.string().regex(new RegExp(uuidValidationPattern));

export const iso8601DateTimeValidationPattern =
    "^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2}(?:.\\d*)?)((-(\\d{2}):(\\d{2})|Z)?)$";
export const zodIso8601DateTime = zod
    .string()
    .regex(new RegExp(iso8601DateTimeValidationPattern));
