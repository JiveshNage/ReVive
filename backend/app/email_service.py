import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, html_content: str, text_content: str | None = None) -> bool:
    """
    Sends an email using Brevo SMTP relay.
    Returns True if successful, False otherwise.
    """
    if not to_email or "@" not in to_email:
        logger.warning("Invalid recipient email: %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email

    if text_content:
        msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    if not settings.smtp_login or not settings.smtp_password:
        logger.info(
            "SMTP credentials not configured in environment. Skipping external email dispatch for %s (subject: %s).",
            to_email,
            subject,
        )
        return False

    try:
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(settings.smtp_login, settings.smtp_password)
            server.sendmail(settings.smtp_from_email, [to_email], msg.as_string())
        logger.info("Email dispatched successfully to %s via SMTP", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)
        return False


def send_otp_email(to_email: str, otp_code: str, user_name: str = "Collector") -> bool:
    subject = f"ReVive Verification Code: {otp_code}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #064e3b; margin-top: 0;">ReVive — E-Waste Lifecycle Platform</h2>
        <p>Namaste {user_name},</p>
        <p>Your 6-digit verification code to access the ReVive National E-Waste Portal is:</p>
        <div style="background: #f0fdf4; border: 1px dashed #059669; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #047857;">{otp_code}</span>
        </div>
        <p style="font-size: 12px; color: #64748b;">This code is valid for 10 minutes. If you did not request this login, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">CPCB Registered Informal Sector Inclusion · SIH 2026</p>
    </div>
    """
    return send_email(to_email, subject, html, f"Your ReVive verification code is: {otp_code}")
