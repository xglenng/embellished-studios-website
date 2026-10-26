const origins = new Set(['https://embellishedstudios.com', 'https://www.embellishedstudios.com']);
const hosts = new Set(['embellishedstudios.com', 'www.embellishedstudios.com']);
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    if (origins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const reply = (status, message) => new Response(JSON.stringify({ message }), { status, headers });
    if (new URL(request.url).pathname !== '/inquiry') return reply(404, 'Not found.');
    if (!origins.has(origin)) return reply(403, 'This website is not allowed.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '600'
    } });
    if (request.method !== 'POST') return reply(405, 'Use POST.');
    if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) return reply(503, 'Email is temporarily unavailable. Please contact the studio directly.');
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return reply(415, 'Use JSON.');
    try {
      // Limit streamed bodies too; do not rely on a client-supplied Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply(400, 'Please complete the form.');
      const chunks = []; let length = 0;
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 16000) { await reader.cancel(); return reply(413, 'Your message is too long.'); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      let data;
      try { data = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply(400, 'Invalid form data.'); }
      if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, 'Invalid form data.');
      if (data.website) return reply(400, 'Unable to submit this form.');
      const field = (key, max, min = 1) => typeof data[key] === 'string' && data[key].trim().length >= min && data[key].trim().length <= max;
      if (!field('name', 100) || !field('email', 254) || !field('phone', 40) || !field('subject', 160) || !field('message', 5000) ||
          !field('token', 2048) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) ||
          /[\r\n]/.test(data.name + data.email + data.subject)) return reply(400, 'Please enter valid contact details and a message.');
      const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: data.token,
          remoteip: request.headers.get('CF-Connecting-IP') || undefined }),
        signal: AbortSignal.timeout(10000)
      });
      if (!verificationResponse.ok) return reply(503, 'Verification is unavailable. Please try again.');
      const verified = await verificationResponse.json();
      if (!verified.success || !hosts.has(verified.hostname) || verified.action !== 'inquiry')
        return reply(400, 'Please complete the security check again.');
      // Plain text avoids rendering untrusted customer HTML. Destination is fixed.
      const sent = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Embellished Studios <inquiries@embellishedstudios.com>',
          to: ['embellished.studios.stg@gmail.com'], reply_to: data.email.trim(),
          subject: 'Website inquiry: ' + data.subject.trim(),
          text: ['Name: ' + data.name.trim(), 'Email: ' + data.email.trim(), 'Phone: ' + data.phone.trim(),
            '', data.message.trim()].join('\n')
        }),
        signal: AbortSignal.timeout(15000)
      });
      if (!sent.ok) return reply(502, 'Your inquiry could not be sent. Please try again or contact the studio directly.');
      const result = await sent.json();
      if (!result.id) return reply(502, 'Sending could not be confirmed. Please contact the studio directly.');
      return reply(200, 'Your inquiry has been sent to Embellished Studios.');
    } catch {
      return reply(503, 'Sending is temporarily unavailable. Please try again or contact the studio directly.');
    }
  }
};
