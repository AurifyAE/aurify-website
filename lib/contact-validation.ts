import { validatePhoneForCountry } from "@/lib/phone-validation";

export type ContactField = "name" | "email" | "company" | "phone" | "message";
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export type ContactValues = {
  name: string;
  email: string;
  company: string;
  phone: string;
  phoneCountryCode: string;
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textValue(data: Record<string, unknown>, field: string) {
  return typeof data[field] === "string" ? data[field].trim() : "";
}

export function validateContact(data: Record<string, unknown>): {
  values: ContactValues;
  errors: ContactFieldErrors;
} {
  const values: ContactValues = {
    name: textValue(data, "name"),
    email: textValue(data, "email"),
    company: textValue(data, "company"),
    phone: textValue(data, "phone"),
    phoneCountryCode: textValue(data, "phoneCountryCode"),
    message: textValue(data, "message"),
  };
  const errors: ContactFieldErrors = {};

  if (!values.name) errors.name = "Enter your name.";
  else if (values.name.length < 2)
    errors.name = "Name must be at least 2 characters.";
  else if (values.name.length > 100)
    errors.name = "Name must be 100 characters or fewer.";

  if (!values.email) errors.email = "Enter your email address.";
  else if (values.email.length > 254 || !emailPattern.test(values.email))
    errors.email = "Enter a valid email address.";

  if (values.company.length > 120)
    errors.company = "Company name must be 120 characters or fewer.";

  const phoneValidation = validatePhoneForCountry(
    values.phone,
    values.phoneCountryCode
  );
  if (phoneValidation.error) errors.phone = phoneValidation.error;
  else if (phoneValidation.normalized) values.phone = phoneValidation.normalized;

  if (!values.message) errors.message = "Enter a message.";
  else if (values.message.length < 10)
    errors.message = "Message must be at least 10 characters.";
  else if (values.message.length > 2_000)
    errors.message = "Message must be 2,000 characters or fewer.";

  return { values, errors };
}
