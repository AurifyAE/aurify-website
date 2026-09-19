# Brochure lead Google Sheets setup

The header, mobile menu, and footer brochure buttons use one lead-capture
dialog asking for a work email and phone number. The PDF is released only after
the details have been stored successfully.

The dialog can also be opened from a shareable link, for emails, ads, or QR
codes:

```
https://aurify.global/brochure
```

It redirects to `/?brochure=open`, which opens the dialog on the homepage. Leads
from this link are recorded with the CTA source `direct-link`.

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
   `Brochure Downloads` tab appears with the email, CTA source, page, phone
   number, and phone country.

The Apps Script de-duplicates submissions by normalized email address. A
returning visitor can still download the brochure, but the Sheet keeps one row
per email.

## Updating an existing deployment

When `brochure-leads.gs` changes, paste the new version into the Apps Script
editor, then open **Deploy > Manage deployments**, edit the existing web app,
and set **Version** to **New version**. Editing the deployment keeps the `/exec`
URL, so the website environment does not change. The script adds any missing
header columns to the existing sheet on the next submission.
