import {
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js/mobile";
import { countries } from "@/lib/content/countries";

export type PhoneValidationResult = {
  error?: string;
  normalized?: string;
};

export function validatePhoneForCountry(
  phone: string,
  countryCode: string
): PhoneValidationResult {
  if (!phone.trim()) {
    return { error: "Enter your mobile or WhatsApp number." };
  }

  const country = countries.find((item) => item.code === countryCode);
  if (!country) {
    return { error: "Choose a valid phone country code." };
  }

  if (!/^[0-9\s()\-]+$/.test(phone)) {
    return { error: `Enter a valid mobile number for ${country.name}.` };
  }

  const code = country.code as CountryCode;
  const lengthProblem = validatePhoneNumberLength(phone, code);

  if (lengthProblem === "TOO_SHORT") {
    return { error: `The mobile number is too short for ${country.name}.` };
  }

  if (lengthProblem === "TOO_LONG") {
    return { error: `The mobile number is too long for ${country.name}.` };
  }

  if (lengthProblem) {
    return { error: `Enter a mobile number with a valid length for ${country.name}.` };
  }

  const parsedPhone = parsePhoneNumberFromString(phone, code);
  if (!parsedPhone?.isValid()) {
    return { error: `Enter a valid mobile number for ${country.name}.` };
  }

  return { normalized: parsedPhone.number };
}
