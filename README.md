# Embellished Studios Website

A standalone, mobile-first website for Embellished Studios LLC. It has no Squarespace dependency and can be hosted from GitHub Pages, Vercel, Netlify, Cloudflare Pages, or any static web host.

## Included pages

- `index.html` — homepage and services
- `tattoo-request-form/` — tattoo request with optional, unchecked SMS consent
- `piercing-request-form/` — piercing request with optional, unchecked SMS consent
- `piercing-trainings/` — weekend piercing course and apprenticeship information
- `apprenticeships/` and `apprenticeships/piercing-course/` — preserved legacy training routes
- `tattoo-portfolio/` — preserved portfolio route and current-work link
- `contact/` — studio contact details and disclosed BOOK keyword flow
- `sms-consent/` — public SMS program and opt-in evidence page
- `privacy-policy/` — publicly accessible privacy policy
- `terms/` — publicly accessible terms and SMS program terms
- `assets/` — shared styles, scripts, favicon, and hero artwork
- `sitemap.xml`, `robots.txt`, and canonical tags — search migration support
- `.nojekyll` — tells GitHub Pages to publish the static files unchanged

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. After the GitHub Pages preview works, add `embellishedstudios.com` under the Pages custom-domain setting and follow GitHub's DNS instructions.

## Domain migration from Squarespace

Do not cancel Squarespace or change DNS until the replacement site is deployed and reviewed. After deployment:

1. Add `embellishedstudios.com` to the new hosting provider.
2. Copy the provider's required DNS records.
3. Update DNS where the domain is registered.
4. Verify HTTPS, every page, SMS links, email links, and mobile layout.
5. Keep the old site active until DNS propagation is complete.

If the domain itself is registered through Squarespace, it can remain registered there while its DNS points to the new host. Domain transfer is optional.

## Twilio resubmission checklist

- Use `https://www.embellishedstudios.com/sms-consent/` as public keyword opt-in evidence after launch.
- Use `https://www.embellishedstudios.com/privacy-policy/` and `https://www.embellishedstudios.com/terms/` in the campaign submission.
- Use the tattoo or piercing request page as website-checkbox evidence.
- Capture screenshots showing the phone field, unchecked checkbox, complete consent wording, links, and button.
- Configure BOOK as an opt-in keyword if the campaign declares keyword opt-in.
- Configure the automatic BOOK reply with the brand, program purpose, frequency, rates, HELP, and STOP instructions.
- Keep Privacy Policy and Terms publicly accessible without login.
- Ensure campaign samples identify Embellished Studios and include STOP language.

## Important integration note

The request pages intentionally prepare a text message on the visitor's device. The visitor reviews and sends it from their own Messages app. No server or form processor is required. Email remains available for visitors who do not consent to SMS.
