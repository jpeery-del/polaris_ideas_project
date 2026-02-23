import nodemailer from 'nodemailer'

const RESET_EXPIRY_HOURS = 1

function getBaseUrl() {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.trim().replace(/\/$/, '')
  if (process.env.RAILWAY_STATIC_URL) return process.env.RAILWAY_STATIC_URL
  return 'http://localhost:5173'
}

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'true'

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: !!secure,
      auth: { user, pass },
    })
  }
  return null
}

/** Send password reset email. If SMTP is not configured, logs the link and resolves (for dev). */
export async function sendPasswordResetEmail(email, resetToken) {
  const baseUrl = getBaseUrl()
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`
  const transporter = createTransporter()

  const message = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@dialoguebuddy.local',
    to: email,
    subject: 'Reset your Dialogue Buddy password',
    text: `You requested a password reset for Dialogue Buddy. Click the link below to set a new password (valid for ${RESET_EXPIRY_HOURS} hour):\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset for Dialogue Buddy.</p>
      <p><a href="${resetUrl}">Reset your password</a> (link valid for ${RESET_EXPIRY_HOURS} hour).</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `.trim(),
  }

  if (transporter) {
    await transporter.sendMail(message)
    return
  }

  console.log('[Email not configured] Password reset link (dev):', resetUrl)
}

export function getResetExpiryHours() {
  return RESET_EXPIRY_HOURS
}
