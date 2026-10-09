# DIGITAL FUTURE STATE — v1 prototype

A responsive static website prototype for the DIGITAL FUTURE STATE concept.

## Files
- `index.html` — landing page, passport-style profile preview, sample directory, security notes, citizen contact form, footer legal links.
- `styles.css` — responsive dark navy / gold design system.
- `app.js` — menu, profile preview, local photo preview, directory search, print action, email-draft contact interaction, cookie notice.
- `widerruf.html`, `agb.html`, `datenschutz.html`, `impressum.html` — German legal-information drafts.

## Preview
Open `index.html` in a browser or deploy this repository as a static site on Vercel / GitHub Pages.

## Important status
This is a **front-end prototype**, not a production identity or subscription service.
- Profile preview data is not stored in a secure account or database.
- The profile/passport-style card is not a government document, passport, visa, or proof of citizenship.
- No login, identity verification, server-side contact storage, Stripe payment, paid membership, or universal single sign-on is implemented.
- The contact form opens the visitor's email application to prepare a message to `contact@digital-future.ai`; it does not send or store the message itself.
- The sample directory contains public external links and does not imply partnerships or supported single sign-on.
- The planned €4.99/month price is informational only; no charge can be made by this prototype.
- Legal pages contain draft text and placeholders. Complete them with accurate operator details and obtain legal review before production.

## Before production
1. Add a secure authentication and database layer with access controls and data minimization.
2. Implement and test the real complaint/request intake path and privacy retention process.
3. Configure a payment provider and legally compliant subscription, cancellation, and refund flows.
4. Replace legal placeholders with verified details and reviewed legal text.
5. Verify the custom domain and production deployment settings before switching live traffic.
