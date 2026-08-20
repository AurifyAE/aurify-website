# Brochure lead Google Sheets setup

The header, mobile menu, and footer brochure buttons use one email-capture
dialog. The PDF is released only after the email has been stored successfully.

1. Create a Google Sheet dedicated to brochure leads. If another Sheet already
   has a `doPost` Apps Script, do not replace it with this one.
2. Open **Extensions > Apps Script**.
3. Replace the editor contents with
   `scripts/google-apps-script/brochure-leads.gs` from this project.
4. In Apps Script, open **Project Settings > Script Properties** and add:
   - Property: `BROCHURE_WEBHOOK_SECRET`
   - Value: a long random secret, at least 32 characters
5. Select **Deploy > New deployment > Web app**.
6. Set **Execute as** to yourself and access to **Anyone**. The shared secret
   still protects direct writes to the Sheet.
7. Authorize the script and copy the deployment URL ending in `/exec`.
8. Add the following values to the website deployment environment:

```env
BROCHURE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
BROCHURE_GOOGLE_SHEETS_WEBHOOK_SECRET=the-same-long-random-secret
```

9. Redeploy the website, submit the brochure form once, and confirm that a
   `Brochure Downloads` tab appears with the email, CTA source, and page.

The Apps Script de-duplicates submissions by normalized email address. A
returning visitor can still download the brochure, but the Sheet keeps one row
per email.
