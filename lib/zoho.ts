/**
 * Zoho CRM (UAE data centre) lead delivery, shared by the contact and
 * brochure routes. Needs ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and
 * ZOHO_REFRESH_TOKEN (scope ZohoCRM.modules.leads.ALL).
 */

const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.ae";
const ZOHO_API_URL = "https://www.zohoapis.ae";

export type ZohoLead = Record<string, unknown> & {
  Last_Name: string;
  Email: string;
  Lead_Source: string;
};

export function isZohoConfigured() {
  return Boolean(
    process.env.ZOHO_CLIENT_ID &&
      process.env.ZOHO_CLIENT_SECRET &&
      process.env.ZOHO_REFRESH_TOKEN
  );
}

// Zoho access tokens live 1h; reuse one per server instance.
let zohoToken: { value: string; expiresAt: number } | null = null;

async function getZohoAccessToken() {
  if (zohoToken && zohoToken.expiresAt > Date.now()) return zohoToken.value;

  const res = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(json)}`);
  }

  zohoToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return zohoToken.value;
}

async function zohoFetch(path: string, init: RequestInit = {}) {
  return fetch(`${ZOHO_API_URL}/crm/v8${path}`, {
    ...init,
    headers: {
      Authorization: `Zoho-oauthtoken ${await getZohoAccessToken()}`,
      "Content-Type": "application/json",
    },
  });
}

async function writeLead(path: string, lead: ZohoLead, extra = {}) {
  const res = await zohoFetch(path, {
    method: "POST",
    body: JSON.stringify({
      data: [
        {
          Lead_Status: "Not Contacted",
          Tag: [{ name: "Website Enquiry" }],
          ...lead,
        },
      ],
      trigger: [],
      ...extra,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.data?.[0]?.status !== "success") {
    throw new Error(`Zoho lead write failed: ${JSON.stringify(json)}`);
  }
}

/** Creates the lead, or updates the existing lead with the same email. */
export function upsertZohoLead(lead: ZohoLead) {
  return writeLead("/Leads/upsert", lead, { duplicate_check_fields: ["Email"] });
}

/**
 * Creates the lead only when no lead has this email yet, so a thin form
 * (e.g. brochure: email as name) never overwrites a richer existing lead.
 */
export async function createZohoLeadIfNew(lead: ZohoLead) {
  const res = await zohoFetch(
    `/Leads/search?email=${encodeURIComponent(lead.Email)}`
  );
  if (res.status === 200) return; // already in Zoho
  if (res.status !== 204) {
    throw new Error(`Zoho lead search failed: ${res.status} ${await res.text()}`);
  }
  await writeLead("/Leads", lead);
}
