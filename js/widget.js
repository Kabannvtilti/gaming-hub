const rates = Object.freeze({ standard: 80, performance: 120, console: 150 });
const minimumHours = 1;
const maximumHours = 12;
const headsetFee = 50;
const money = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' });

export function calculateSession(rawHours, plan, headset, badInput = false) {
  const hours = Number(rawHours);
  let hoursError = '';

  if (badInput) {
    hoursError = 'Введіть ціле число від 1 до 12.';
  } else if (rawHours === '') {
    hoursError = 'Вкажіть тривалість сесії.';
  } else if (!/^\d+$/.test(rawHours) || !Number.isSafeInteger(hours)) {
    hoursError = 'Введіть ціле число від 1 до 12.';
  } else if (hours < minimumHours || hours > maximumHours) {
    hoursError = 'Тривалість має бути від 1 до 12 годин.';
  }

  const planError = Object.hasOwn(rates, plan) ? '' : 'Оберіть тариф зі списку.';
  const total = hoursError || planError ? null : hours * rates[plan] + (headset ? headsetFee : 0);
  return { total, hoursError, planError };
}

function showFieldError(field, message, error) {
  field.setAttribute('aria-invalid', String(Boolean(error)));
  field.classList.toggle('border-rose-400', Boolean(error));
  field.classList.toggle('border-border', !error);
  message.textContent = error;
  message.hidden = !error;
}

export function mountSessionCalculator(root) {
  const form = root.querySelector('[data-session-form]');
  const hours = root.querySelector('[data-hours]');
  const hoursMessage = root.querySelector('[data-hours-error]');
  const plan = root.querySelector('[data-plan]');
  const planMessage = root.querySelector('[data-plan-error]');
  const headset = root.querySelector('[data-headset]');
  const total = root.querySelector('[data-total]');
  const status = root.querySelector('[data-session-status]');
  if (!form || !hours || !hoursMessage || !plan || !planMessage || !headset || !total || !status) return;

  const update = () => {
    const result = calculateSession(hours.value, plan.value, headset.checked, hours.validity.badInput);
    showFieldError(hours, hoursMessage, result.hoursError);
    showFieldError(plan, planMessage, result.planError);
    total.textContent = result.total === null ? '—' : money.format(result.total);
    status.hidden = result.total !== null;
    status.textContent = result.hoursError || result.planError;
  };

  form.addEventListener('submit', event => event.preventDefault());
  hours.addEventListener('input', update);
  plan.addEventListener('change', update);
  headset.addEventListener('change', update);
  update();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-session-calculator]').forEach(mountSessionCalculator);
}
