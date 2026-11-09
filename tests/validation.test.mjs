import test from "node:test";
import assert from "node:assert/strict";
import { validateName, validateEmail, validatePhone, validateMessage, validateAgreement, suggestPhone } from "../js/validation-rules.js";

const checks = [
  ["name: empty", validateName, "", false],
  ["name: spaces", validateName, "   ", false],
  ["name: one letter", validateName, "І", false],
  ["name: two letters", validateName, "Ія", true],
  ["name: Cyrillic apostrophe", validateName, "Мар’яна", true],
  ["name: Latin hyphen", validateName, "Anne-Marie", true],
  ["name: outer whitespace", validateName, "  Олена  ", true],
  ["name: 80 letters", validateName, "А".repeat(80), true],
  ["name: 81 letters", validateName, "А".repeat(81), false],
  ["name: digits", validateName, "1234", false],
  ["name: emoji", validateName, "🎮🎮", false],
  ["name: HTML", validateName, "<b>Ірина</b>", false],
  ["email: regular", validateEmail, "iryna@example.com", true],
  ["email: alias and long TLD", validateEmail, "User+lab@example.technology", true],
  ["email: empty", validateEmail, "", false],
  ["email: missing at", validateEmail, "wrong-email", false],
  ["email: missing TLD", validateEmail, "user@com", false],
  ["email: two at signs", validateEmail, "user@@example.com", false],
  ["email: consecutive local dots", validateEmail, "a..b@example.com", false],
  ["email: leading local dot", validateEmail, ".ab@example.com", false],
  ["email: empty domain label", validateEmail, "ab@example..com", false],
  ["email: domain hyphen edge", validateEmail, "ab@-example.com", false],
  ["email: Cyrillic local", validateEmail, "олена@example.com", false],
  ["email: inner space", validateEmail, "a b@example.com", false],
  ["email: very long local", validateEmail, `${"a".repeat(65)}@example.com`, false],
  ["phone: valid", validatePhone, "+380501234567", true],
  ["phone: local format", validatePhone, "0501234567", false],
  ["phone: prefix only", validatePhone, "+380", false],
  ["phone: short", validatePhone, "+38050123456", false],
  ["phone: long", validatePhone, "+3805012345678", false],
  ["phone: spaces", validatePhone, "+380 50 123 45 67", false],
  ["phone: parentheses", validatePhone, "+380(50)1234567", false],
  ["phone: hyphens", validatePhone, "+38050-123-45-67", false],
  ["phone: letters", validatePhone, "+380abc123456", false],
  ["phone: trailing space", validatePhone, "+380501234567 ", false],
  ["phone: trailing newline", validatePhone, "+380501234567\n", false],
  ["phone: Unicode digits", validatePhone, "+380５０１２３４５６７", false],
  ["message: empty", validateMessage, "", false],
  ["message: spaces", validateMessage, "            ", false],
  ["message: nine characters", validateMessage, "123456789", false],
  ["message: ten characters", validateMessage, "1234567890", true],
  ["message: emoji code points", validateMessage, "🎮".repeat(10), true],
  ["message: Cyrillic and Latin", validateMessage, "Додайте Wiki guide", true],
  ["message: HTML stays plain data", validateMessage, "<script>alert(1)</script>", true],
  ["message: 2000 characters", validateMessage, "a".repeat(2000), true],
  ["message: 2001 characters", validateMessage, "a".repeat(2001), false],
  ["agreement: missing", validateAgreement, false, false],
  ["agreement: checked", validateAgreement, true, true],
];
for (const [title, validate, input, expected] of checks) {
  test(title, () => assert.equal(validate(input) === "", expected));
}
test("phone suggestion is explicit and lossless", () => {
  assert.equal(suggestPhone("0501234567"), "+380501234567");
  for (const input of ["05012345678", "0501234567\n", "+380501234567", "050 123 45 67", "050abc4567"])
    assert.equal(suggestPhone(input), "");
});
