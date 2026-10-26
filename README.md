# Embellished Studios Website

Static GitHub Pages website for Embellished Studios.

## Appointment forms
- Tattoo requests embed Jotform `241578438382163`.
- Piercing requests embed Jotform `241578151269159`.
- Appointment requests are submitted through Jotform.

## Training
Training offers tattoo and piercing apprenticeships at $5,000 each, plus a dual tattoo and piercing apprenticeship at $8,000 ($2,000 savings). Each program has an email inquiry button.

## Contact
Visitors can text 435-668-5988 or email embellished.studios.stg@gmail.com from the Contact page. SMS opt-in/BOOK keyword content has been removed from this website because messaging consent is being moved to Maia.

## Direct inquiry emails
Contact and apprenticeship inquiry forms post to the Cloudflare Worker at
https://embellished-inquiries.xglenng.workers.dev/inquiry. GitHub Pages continues
serving the website; appointment requests retain their Jotform embeds.

Worker source: workers/inquiries/worker.mjs.
Required Worker secrets: RESEND_API_KEY and TURNSTILE_SECRET_KEY.
Never add either secret to this repository or browser JavaScript.
The public Turnstile site key is configured in the three inquiry pages.

The endpoint validates fields, origin, Turnstile hostname/action, and token before
sending a plain-text email through Resend to the fixed studio Gmail inbox.
It does not log submission contents. Delivery failures retain form input.
Cloudflare and Resend process inquiry details; review privacy disclosures before launch.

Run checks: node --test workers/inquiries/worker.test.mjs
and node --check assets/inquiries.js.
Publish the Worker source using Cloudflare's code editor; retain its existing secrets.
Then push the website changes to GitHub Pages. Test from the actual custom domain:
Turnstile tokens only work for configured hostnames, not localhost or the Sites preview.
A real successful inquiry and inbox delivery must be checked before claiming end-to-end success.
Rollback: restore the prior HTML and remove the added inquiry script; the prior
mailto/text forms and Jotform appointment pages are independent of the Worker.
