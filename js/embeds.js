for (const placeholder of document.querySelectorAll('[data-embed]')) {
  const button = placeholder.querySelector('[data-load-embed]');
  const template = placeholder.querySelector('template');
  if (!button || !template?.content.querySelector('iframe')) continue;

  button.hidden = false;
  button.addEventListener('click', () => {
    const frame = template.content.querySelector('iframe').cloneNode();
    placeholder.replaceWith(frame);
    frame.focus();
  }, { once: true });
}
