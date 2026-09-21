import nodemailer from "nodemailer";

/**
 * Creates a Nodemailer transporter using Gmail + App Password.
 * Requires: EMAIL_USER and EMAIL_PASS in .env
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-char Gmail App Password (not your normal password)
  },
});

/**
 * Sends a password reset email to the given address.
 * @param {string} toEmail  - Recipient email address
 * @param {string} resetUrl - Full reset URL (e.g. http://localhost:5173/reset-password?token=xxx)
 */
export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const mailOptions = {
    from: `"YamuLK 🌿" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your YamuLK Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="540" cellpadding="0" cellspacing="0" style="background:#161b27;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:100%;">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#34d399,#22d3ee);padding:32px;text-align:center;">
                    <div style="font-size:32px;margin-bottom:8px;">🌿</div>
                    <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">YamuLK</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">Explore Sri Lanka, Your Way</div>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#f1f5f9;">Reset Your Password</h2>
                    <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;line-height:1.6;">
                      We received a request to reset the password for your YamuLK account. Click the button below to choose a new password.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align:center;margin:28px 0;">
                      <a href="${resetUrl}"
                         style="display:inline-block;background:linear-gradient(135deg,#34d399,#22d3ee);color:#0f1117;font-weight:700;font-size:15px;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.3px;">
                        🔑 Reset Password
                      </a>
                    </div>

                    <!-- Expiry notice -->
                    <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:12px 16px;margin-bottom:20px;">
                      <p style="margin:0;font-size:13px;color:#fbbf24;">
                        ⏰ This link expires in <strong>1 hour</strong>. After that, you'll need to request a new one.
                      </p>
                    </div>

                    <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6;">
                      If you didn't request a password reset, you can safely ignore this email — your password won't change.
                    </p>

                    <!-- Raw URL fallback -->
                    <p style="margin:16px 0 0;font-size:11px;color:#475569;">
                      If the button doesn't work, copy and paste this URL into your browser:<br/>
                      <span style="color:#34d399;word-break:break-all;">${resetUrl}</span>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#0f1117;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0;font-size:11px;color:#334155;text-align:center;">
                      © ${new Date().getFullYear()} YamuLK · Sri Lanka Travel Planner<br/>
                      This email was sent to ${toEmail}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
