import { Resend } from "resend";

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (hostname && xReplitToken) {
    try {
      const data = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
        {
          headers: {
            Accept: "application/json",
            "X-Replit-Token": xReplitToken,
          },
        }
      )
        .then((r) => r.json())
        .then((d: { items?: { settings: { api_key: string; from_email: string } }[] }) => d.items?.[0]);

      if (data?.settings?.api_key) {
        return {
          apiKey: data.settings.api_key,
          fromEmail: data.settings.from_email || "noreply@bloq5.com",
        };
      }
    } catch {
      // Fall through to env var fallback
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend: aucune clé API trouvée (RESEND_API_KEY ou connecteur Replit)");
  }

  return {
    apiKey,
    fromEmail: process.env.FROM_EMAIL || "noreply@bloq5.com",
  };
}

export async function getUncachableResendClient(): Promise<{
  client: Resend;
  fromEmail: string;
}> {
  const { apiKey, fromEmail } = await getCredentials();
  return { client: new Resend(apiKey), fromEmail };
}
