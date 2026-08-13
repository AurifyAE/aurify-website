# DBRG webinar Google Sheets setup

1. Create or open the Google Sheet that will receive webinar registrations.
2. Open **Extensions > Apps Script**.
3. Replace the editor contents with `scripts/google-apps-script/dbrg-registration.gs` from this project.
4. In Apps Script, open **Project Settings > Script Properties** and add:
   - Property: `DBRG_WEBHOOK_SECRET`
   - Value: a long random secret, at least 32 characters
5. Select **Deploy > New deployment > Web app**.
6. Set **Execute as** to yourself and access to **Anyone**. The shared secret still protects writes.
7. Authorize the script and copy the deployment URL ending in `/exec`.
8. Add these values to the website deployment environment:

```env


DBRG_REGISTRATION_TO_EMAIL=registrations@example.com
```

The existing `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` values must also be configured. The sender address must be verified in Resend.

After changing the Apps Script code, create a new deployment version. Test the public form once and confirm that the row appears in the `Registrations` tab and the attendee receives the confirmation email.
