const YELLOW = "#F5A623";
const DARK   = "#1A1A1A";

/** Escape user-controlled values before embedding them in HTML emails. */
function h(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function baseLayout(content: string): string {
  // nosemgrep: javascript.lang.security.html-in-template-string
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BLOQ5</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:${DARK};padding:24px 32px;">
            <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
              BLOQ<span style="color:${YELLOW};">5</span>
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F5F5F5;padding:20px 32px;border-top:1px solid #E8E8E8;">
            <p style="margin:0;font-size:12px;color:#999;text-align:center;">
              © ${new Date().getFullYear()} bloq5 inc. — Plateforme de gestion immobilière au Canada<br/>
              <a href="https://bloq5.com" style="color:${YELLOW};text-decoration:none;">bloq5.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function otpEmailHtml(code: string, email: string): string {
  // nosemgrep: javascript.lang.security.html-in-template-string -- user data escaped via h()
  return baseLayout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:${YELLOW}22;border-radius:12px;padding:14px;margin-bottom:16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="${YELLOW}" stroke-width="2"/>
          <path d="M2 8l10 7 10-7" stroke="${YELLOW}" stroke-width="2"/>
        </svg>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};">Votre code d'accès Pro</h1>
      <p style="margin:0;font-size:14px;color:#666;">Code envoyé à <strong>${h(email)}</strong></p>
    </div>

    <div style="background:#F9F9F9;border:1px solid #E8E8E8;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">Votre code de vérification</p>
      <div style="letter-spacing:12px;font-size:38px;font-weight:900;color:${DARK};font-family:monospace;">${h(code)}</div>
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:#555;text-align:center;">
      Ce code est valide pendant <strong>10 minutes</strong>.<br/>
      Ne le partagez jamais avec quelqu'un d'autre.
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Si vous n'avez pas demandé ce code, ignorez cet e-mail.
    </p>
  `);
}

export function otpEmailText(code: string): string {
  return `Votre code d'accès BLOQ5 Pro : ${code}\n\nCe code est valide 10 minutes. Ne le partagez jamais.\n\nbloq5.com`;
}

export function resetPasswordEmailHtml(url: string, name: string): string {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};">Réinitialisation du mot de passe</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;">Bonjour ${h(name || "")},</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte BLOQ5.<br/>
      Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${h(url)}" style="display:inline-block;background:${YELLOW};color:${DARK};font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Réinitialiser mon mot de passe →
      </a>
    </div>
    <p style="font-size:13px;color:#aaa;text-align:center;">
      Ce lien expire dans <strong>1 heure</strong>.<br/>
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.
    </p>
    <p style="font-size:11px;color:#ccc;text-align:center;margin-top:16px;word-break:break-all;">
      ${h(url)}
    </p>
  `);
}

export function resetPasswordEmailText(url: string): string {
  return `Réinitialisation du mot de passe BLOQ5\n\nCliquez sur ce lien pour réinitialiser votre mot de passe :\n${url}\n\nCe lien expire dans 1 heure.\n\nbloq5.com`;
}

export function proRecoveryEmailHtml(phone: string, toEmail: string): string {
  const maskedPhone = phone
    ? phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4)
    : "non renseigné";
  // nosemgrep: javascript.lang.security.html-in-template-string -- user data escaped via h()
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};">Récupération de compte Pro</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;">Demande envoyée à <strong>${h(toEmail)}</strong></p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Vous avez demandé la récupération de votre accès à l'espace Pro BLOQ5.<br/>
      Le numéro de téléphone associé à votre compte est :
    </p>
    <div style="background:#F9F9F9;border:1px solid #E8E8E8;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
      <span style="font-size:22px;font-weight:700;color:${DARK};letter-spacing:2px;">${h(maskedPhone)}</span>
    </div>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Utilisez ce numéro pour accéder à votre espace Pro. Si vous n'avez plus accès à ce numéro, 
      contactez notre support à <a href="mailto:support@bloq5.com" style="color:${YELLOW};">support@bloq5.com</a>.
    </p>
    <p style="font-size:12px;color:#aaa;text-align:center;margin-top:24px;">
      Si vous n'avez pas demandé cette récupération, votre compte est en sécurité — ignorez cet e-mail.
    </p>
  `);
}

export function proRecoveryEmailText(phone: string): string {
  const maskedPhone = phone
    ? phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4)
    : "non renseigné";
  return `Récupération de compte Pro BLOQ5\n\nLe numéro associé à votre compte : ${maskedPhone}\n\nSi vous n'avez plus accès à ce numéro, contactez support@bloq5.com\n\nbloq5.com`;
}

export function welcomeEmailHtml(name: string, email: string): string {
  // nosemgrep: javascript.lang.security.html-in-template-string -- user data escaped via h()
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};">Bienvenue sur BLOQ5 !</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#666;">Compte créé pour <strong>${h(email)}</strong></p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Bonjour ${h(name || "")},<br/><br/>
      Votre compte BLOQ5 est prêt. Vous pouvez maintenant rechercher des biens, 
      déposer des dossiers de candidature et suivre vos demandes en temps réel.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://bloq5.com/properties" style="display:inline-block;background:${YELLOW};color:${DARK};font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Découvrir les biens disponibles →
      </a>
    </div>
    <p style="font-size:12px;color:#aaa;text-align:center;">
      Des questions ? Écrivez-nous à <a href="mailto:support@bloq5.com" style="color:${YELLOW};">support@bloq5.com</a>
    </p>
  `);
}

export function welcomeEmailText(name: string): string {
  return `Bienvenue sur BLOQ5, ${name || ""} !\n\nVotre compte est prêt. Commencez à rechercher des biens sur bloq5.com/properties\n\nDes questions ? support@bloq5.com\n\nbloq5.com`;
}

export function emailChangeOtpHtml(code: string, newEmail: string): string {
  // nosemgrep: javascript.lang.security.html-in-template-string -- user data escaped via h()
  return baseLayout(`
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};">Confirmation de changement d'adresse e-mail</h1>
      <p style="margin:0;font-size:14px;color:#666;">Nouvelle adresse : <strong>${h(newEmail)}</strong></p>
    </div>
    <div style="background:#F9F9F9;border:1px solid #E8E8E8;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">Code de vérification</p>
      <div style="letter-spacing:12px;font-size:38px;font-weight:900;color:${DARK};font-family:monospace;">${h(code)}</div>
    </div>
    <p style="margin:0 0 8px;font-size:14px;color:#555;text-align:center;">
      Ce code est valide pendant <strong>10 minutes</strong>.<br/>
      Ne le partagez jamais avec quelqu'un d'autre.
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Si vous n'avez pas demandé ce changement, ignorez cet e-mail — votre adresse reste inchangée.
    </p>
  `);
}

export function emailChangeOtpText(code: string, newEmail: string): string {
  return `Confirmation de changement d'adresse e-mail BLOQ5\n\nNouvelle adresse : ${newEmail}\nCode de vérification : ${code}\n\nCe code est valide 10 minutes.\n\nbloq5.com`;
}

export function passwordChangeOtpHtml(code: string): string {
  return baseLayout(`
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${DARK};">Changement de mot de passe</h1>
      <p style="margin:0;font-size:14px;color:#666;">Entrez ce code pour confirmer la modification.</p>
    </div>
    <div style="background:#F9F9F9;border:1px solid #E8E8E8;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">Code de vérification</p>
      <div style="letter-spacing:12px;font-size:38px;font-weight:900;color:${DARK};font-family:monospace;">${h(code)}</div>
    </div>
    <p style="margin:0 0 8px;font-size:14px;color:#555;text-align:center;">
      Ce code est valide pendant <strong>10 minutes</strong>.<br/>
      Ne le partagez jamais avec quelqu'un d'autre.
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#aaa;text-align:center;">
      Si vous n'avez pas demandé ce changement, ignorez cet e-mail — votre mot de passe reste inchangé.
    </p>
  `);
}

export function passwordChangeOtpText(code: string): string {
  return `Changement de mot de passe BLOQ5\n\nCode de vérification : ${code}\n\nCe code est valide 10 minutes.\n\nbloq5.com`;
}
