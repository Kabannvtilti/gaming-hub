// Чисті правила можна перевіряти окремо від DOM і браузера.
export const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const REGEX_PHONE = /^\+380\d{9}$/;
const NAME_CHARACTERS = /^[\p{L}\p{M}][\p{L}\p{M} '\u2019\u02bc-]*$/u;
const length = (value) => Array.from(value).length;

export function validateName(value) {
  const name = value.trim().normalize("NFC");
  if (length(name) < 2) return "Введіть ім’я щонайменше з 2 символів.";
  if (length(name) > 80) return "Ім’я має містити не більше 80 символів.";
  if (!NAME_CHARACTERS.test(name) || (name.match(/\p{L}/gu) || []).length < 2)
    return "Використовуйте літери, пробіли, апостроф або дефіс.";
  return "";
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "Введіть електронну пошту.";
  if (email.length > 254 || !REGEX_EMAIL.test(email))
    return "Введіть адресу у форматі name@example.com.";
  const [local, domain] = email.split("@");
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes(".."))
    return "Перевірте крапки та довжину частини перед @.";
  const labels = domain.split(".");
  if (labels.some((label) => label.length > 63 || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)))
    return "Перевірте назву домену після @.";
  return "";
}

export function validatePhone(value) {
  // Не обрізаємо й не виправляємо номер непомітно для користувача.
  return value.length === 13 && REGEX_PHONE.test(value)
    ? ""
    : "Введіть +380 і рівно 9 цифр без пробілів, дужок та дефісів.";
}

export function suggestPhone(value) {
  return value.length === 10 && /^0\d{9}$/.test(value) ? `+38${value}` : "";
}

export function validateMessage(value) {
  const count = length(value.trim());
  if (count < 10) return "Напишіть щонайменше 10 символів повідомлення.";
  if (count > 2000) return "Скоротіть повідомлення до 2000 символів.";
  return "";
}

export function validateAgreement(checked) {
  return checked ? "" : "Підтвердьте згоду з політикою конфіденційності.";
}
