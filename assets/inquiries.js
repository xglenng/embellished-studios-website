document.querySelectorAll('[data-inquiry-form]').forEach((form) => {
  let busy = false;
  const status = form.querySelector('[role="status"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(form);
    const button = event.submitter;
    if (button?.dataset.send === 'sms') {
      const body = ['Name: ' + data.get('name'), 'Email: ' + data.get('email'),
        'Phone: ' + data.get('phone'), 'Subject: ' + data.get('subject'), '', data.get('message')].join('\n');
      const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
      window.location.href = 'sms:+14356685988' + separator + 'body=' + encodeURIComponent(body);
      return;
    }
    const token = data.get('cf-turnstile-response');
    if (!token) { status.textContent = 'Please complete the security check before sending.'; return; }
    busy = true;
    const buttons = [...form.querySelectorAll('[type="submit"]')];
    buttons.forEach((b) => { b.disabled = true; });
    status.textContent = 'Sending your inquiry…';
    try {
      const response = await fetch('https://embellished-inquiries.xglenng.workers.dev/inquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name:data.get('name'), email:data.get('email'),phone:data.get('phone'),
          subject:data.get('subject'),message:data.get('message'),website:data.get('website'), token}),
        signal: AbortSignal.timeout(30000)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to send your inquiry.');
      form.reset();
      status.textContent = result.message;
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' || error.name === 'TypeError'
        ? 'We could not confirm sending. Please contact embellished.studios.stg@gmail.com directly or try again.'
        : error.message;
    } finally {
      busy = false;
      buttons.forEach((b) => { b.disabled = false; });
      if (window.turnstile) window.turnstile.reset();
    }
  });
});

// Program links open the on-page form with the selected apprenticeship.
document.querySelectorAll('[data-inquiry-subject]').forEach((link) => {
  link.addEventListener('click', () => {
    const form = document.getElementById('training-inquiry');
    if (!form) return;
    form.elements.subject.value = link.dataset.inquirySubject;
    form.elements.name.focus({ preventScroll: true });
  });
});
