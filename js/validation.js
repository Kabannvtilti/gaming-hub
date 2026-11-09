import {
  validateName, validateEmail, validatePhone,
  validateMessage, validateAgreement, suggestPhone,
} from "./validation-rules.js";

const form = document.getElementById("feedbackForm");
const dialog = document.getElementById("successModal");
const submitButton = document.getElementById("feedback-submit");
const formStatus = document.getElementById("form-status");
const phoneSuggestion = document.getElementById("phone-suggestion");
const fields = [
  { id: "username", validate: validateName },
  { id: "email", validate: validateEmail },
  { id: "phone", validate: validatePhone },
  { id: "message", validate: validateMessage },
  { id: "agreement", validate: validateAgreement },
].map((field) => ({
  ...field,
  input: document.getElementById(field.id),
  message: document.getElementById(`${field.id}-error`),
  shell: document.getElementById(field.id === "agreement" ? "agreement-shell" : field.id),
}));
const touched = new Set();
let submissionLocked = false;
let alreadyScrollLocked = false;
let dialogOpenedAt = 0;

function clearError(field) {
  field.input.setAttribute("aria-invalid", "false");
  field.shell.classList.remove("border-red-500", "border-green-500");
  field.shell.classList.add("border-border");
  field.message.textContent = "";
  field.message.hidden = true;
  field.message.classList.remove("text-red-300", "text-green-300");
}

function showError(field, message) {
  clearError(field);
  field.input.setAttribute("aria-invalid", "true");
  field.shell.classList.replace("border-border", "border-red-500");
  field.message.classList.add("text-red-300");
  field.message.textContent = message;
  field.message.hidden = false;
}

function showSuccess(field) {
  clearError(field);
  field.shell.classList.replace("border-border", "border-green-500");
  field.message.classList.add("text-green-300");
  field.message.textContent = "Заповнено правильно.";
  field.message.hidden = false;
}

function validateField(field) {
  const value = field.id === "agreement" ? field.input.checked : field.input.value;
  const error = field.validate(value);
  if (error) showError(field, error);
  else showSuccess(field);
  return !error;
}

function updatePhoneSuggestion() {
  const suggestion = suggestPhone(document.getElementById("phone").value);
  phoneSuggestion.hidden = !suggestion;
  phoneSuggestion.textContent = suggestion ? `Використати ${suggestion}` : "";
}

for (const field of fields) {
  field.input.addEventListener("blur", () => {
    if (submissionLocked) return;
    touched.add(field.id);
    validateField(field);
  });
  field.input.addEventListener("input", () => {
    if (submissionLocked) return;
    // Нове поле спершу можна спокійно заповнити; помилку уточнюємо після blur.
    if (touched.has(field.id)) validateField(field);
    formStatus.textContent = "";
    if (field.id === "phone") updatePhoneSuggestion();
  });
  if (field.id === "agreement") {
    field.input.addEventListener("change", () => {
      if (submissionLocked) return;
      touched.add(field.id);
      validateField(field);
    });
  }
}

phoneSuggestion.addEventListener("click", () => {
  const phone = fields.find((field) => field.id === "phone");
  const suggestion = suggestPhone(phone.input.value);
  if (!suggestion) return;
  phone.input.value = suggestion;
  touched.add("phone");
  validateField(phone);
  updatePhoneSuggestion();
  phone.input.focus();
});

function resetFeedback() {
  touched.clear();
  fields.forEach(clearError);
  formStatus.textContent = "";
  phoneSuggestion.hidden = true;
  phoneSuggestion.textContent = "";
}
form.addEventListener("reset", resetFeedback);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (submissionLocked) return;
  const invalid = [];
  for (const field of fields) {
    touched.add(field.id);
    if (!validateField(field)) invalid.push(field);
  }
  if (invalid.length) {
    formStatus.textContent = `Перевірте поля з помилками: ${invalid.length}.`;
    invalid[0].input.focus();
    return;
  }
  submissionLocked = true;
  submitButton.disabled = true;
  form.reset();
  alreadyScrollLocked = document.documentElement.classList.contains("overflow-hidden");
  document.documentElement.classList.add("overflow-hidden");
  // Демонстраційне завершення: жодного fetch, збереження чи відправлення даних.
  dialogOpenedAt = performance.now();
  dialog.showModal();
});

document.getElementById("closeModalBtn").addEventListener("click", () => dialog.close());
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [...dialog.querySelectorAll("button, a[href], input, textarea, select, [tabindex]")]
    .filter((element) => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (first && event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (last && !event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
dialog.addEventListener("click", (event) => {
  // Другий клік подвійного натискання Submit не має одразу закрити діалог.
  if (event.target !== dialog || event.detail > 1 || performance.now() - dialogOpenedAt < 300) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener("close", () => {
  if (!alreadyScrollLocked) document.documentElement.classList.remove("overflow-hidden");
  submissionLocked = false;
  submitButton.disabled = false;
  submitButton.focus();
});

// Поки модуль не завантажився, кнопка вимкнена і не може передати форму.
submitButton.disabled = false;
