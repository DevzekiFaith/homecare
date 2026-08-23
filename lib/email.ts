import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const fromEmail = process.env.RESEND_FROM_EMAIL || "HomeCare Support <support@homecare.com.ng>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homecare.com.ng";
const logoUrl = `${siteUrl}/hclogo.png`;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface OrderEmailItem {
  name: string;
  price: number;
  quantity: number;
}

export interface OrderEmailParams {
  toEmail: string;
  customerName: string;
  orderRef: string;
  items: OrderEmailItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
}

/**
 * Send HTML Order Receipt Email to Customer
 */
export async function sendOrderReceiptEmail(params: OrderEmailParams) {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY is not set. Email skipped.");
    return { success: false, reason: "API key missing" };
  }

  try {
    const itemsHtml = params.items
      .map(
        (i) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${i.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">x${i.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0284c7;">₦${(i.price * i.quantity).toLocaleString()}</td>
      </tr>`
      )
      .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #0284c7, #1d4ed8); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 10px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 24px; color: #334155; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
        .footer { background: #f1f5f9; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .cta-btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border-radius: 30px; margin-top: 24px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <img src="${logoUrl}" alt="HomeCare Logo" width="48" height="48" style="border-radius: 12px; vertical-align: middle; display: inline-block;" onError="this.style.display='none'" />
          </div>
          <h1>HomeCare Smart Store</h1>
          <p>Order Payment Receipt & Dispatch Confirmation</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 0;">Hello ${params.customerName},</p>
          <p style="font-size: 13px; line-height: 1.6;">Thank you for shopping with HomeCare! Your payment for order <strong style="color: #0284c7;">#${params.orderRef}</strong> has been received and verified. Our logistics team is preparing your package for dispatch.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b;">Delivery Destination</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #0f172a;">${params.deliveryAddress}</p>
          </div>

          <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">Order Items</p>
          <table>
            <thead>
              <tr style="background: #f8fafc; text-align: left; text-transform: uppercase; font-size: 10px; color: #64748b;">
                <th style="padding: 8px 10px;">Item</th>
                <th style="padding: 8px 10px; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; border-top: 2px solid #f1f5f9; padding-top: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #475569;">
              <span>Subtotal</span>
              <span>₦${params.subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; color: #475569;">
              <span>Nationwide Delivery</span>
              <span>₦${params.deliveryFee.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 10px;">
              <span>Total Paid</span>
              <span style="color: #0284c7;">₦${params.total.toLocaleString()}</span>
            </div>
          </div>

          <!-- Return to Site CTA Button -->
          <div style="text-align: center; margin-top: 28px;">
            <a href="${siteUrl}/customer/dashboard" class="cta-btn">View Order on HomeCare →</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} HomeCare Technologies. Fast & Reliable Home Repairs.</p>
          <p style="margin-top: 6px;">WhatsApp Support: <a href="https://wa.me/2349119059859" style="color: #0284c7; text-decoration: none; font-weight: 700;">+234 911 905 9859</a></p>
          <p style="margin-top: 8px;"><a href="${siteUrl}" style="color: #0284c7; font-weight: 700; text-decoration: none;">Visit HomeCare Website (${siteUrl})</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    const res = await resend.emails.send({
      from: fromEmail,
      to: [params.toEmail],
      subject: `Payment Confirmed: Order #${params.orderRef} — HomeCare Smart Store`,
      html,
    });

    return { success: true, data: res };
  } catch (err: any) {
    console.error("[Email] Order receipt send failed:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Service Request Confirmation Email to Customer
 */
export async function sendServiceBookingEmail(params: {
  toEmail: string;
  customerName: string;
  serviceType: string;
  address: string;
  preferredTime: string;
  orderRef: string;
}) {
  if (!resend) return { success: false, reason: "API key missing" };

  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #0284c7, #1d4ed8); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 10px 0 0 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
        .content { padding: 32px 24px; color: #334155; }
        .cta-btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border-radius: 30px; margin-top: 24px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); }
        .footer { background: #f1f5f9; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <img src="${logoUrl}" alt="HomeCare Logo" width="48" height="48" style="border-radius: 12px; vertical-align: middle; display: inline-block;" onError="this.style.display='none'" />
          </div>
          <h1>HomeCare Service Dispatch</h1>
          <p style="margin-top: 4px; font-size: 13px; opacity: 0.9;">Artisan & Service Booking Confirmation</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 0;">Hello ${params.customerName},</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">Your request for a verified <strong>${params.serviceType}</strong> has been logged under Booking Ref <strong style="color: #0284c7;">#${params.orderRef}</strong>.</p>
          
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">Service Address</p>
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #0f172a;">${params.address}</p>
            <p style="margin: 12px 0 4px 0; font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">Scheduled Time</p>
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #0f172a;">${params.preferredTime}</p>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.6;">Our matching algorithm is pairing an accredited technician in your area. You will receive an SMS and notification once assigned.</p>

          <!-- Return to Site CTA Button -->
          <div style="text-align: center; margin-top: 28px;">
            <a href="${siteUrl}/customer/dashboard" class="cta-btn">Track Request on HomeCare →</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} HomeCare Technologies. Fast & Reliable Home Repairs.</p>
          <p style="margin-top: 6px;">WhatsApp Support: <a href="https://wa.me/2349119059859" style="color: #0284c7; text-decoration: none; font-weight: 700;">+234 911 905 9859</a></p>
          <p style="margin-top: 8px;"><a href="${siteUrl}" style="color: #0284c7; font-weight: 700; text-decoration: none;">Visit HomeCare Website (${siteUrl})</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    const res = await resend.emails.send({
      from: fromEmail,
      to: [params.toEmail],
      subject: `Service Request Received: ${params.serviceType} — HomeCare`,
      html,
    });

    return { success: true, data: res };
  } catch (err: any) {
    console.error("[Email] Service booking email failed:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Customer Support Ticket Email via Resend
 */
export async function sendSupportTicketEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!resend) return { success: false, reason: "API key missing" };

  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #0284c7, #1d4ed8); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 10px 0 0 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
        .content { padding: 28px 24px; color: #334155; }
        .field { margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
        .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin: 0 0 4px 0; }
        .val { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <img src="${logoUrl}" alt="HomeCare Logo" width="44" height="44" style="border-radius: 12px; vertical-align: middle; display: inline-block;" onError="this.style.display='none'" />
          </div>
          <h1>New Customer Support Ticket</h1>
        </div>
        <div class="content">
          <div class="field">
            <p class="label">Customer Name</p>
            <p class="val">${params.name}</p>
          </div>
          <div class="field">
            <p class="label">Customer Email</p>
            <p class="val"><a href="mailto:${params.email}">${params.email}</a></p>
          </div>
          <div class="field">
            <p class="label">Subject Category</p>
            <p class="val">${params.subject}</p>
          </div>
          <div class="field">
            <p class="label">Message Inquiry</p>
            <p class="val" style="white-space: pre-wrap; line-height: 1.6;">${params.message}</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} HomeCare Support Ticketing System.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const res = await resend.emails.send({
      from: fromEmail,
      to: ["support@homecare.com.ng"],
      replyTo: params.email,
      subject: `[Support Ticket] ${params.subject} — from ${params.name}`,
      html,
    });

    return { success: true, data: res };
  } catch (err: any) {
    console.error("[Email] Support ticket failed:", err);
    return { success: false, error: err.message };
  }
}
