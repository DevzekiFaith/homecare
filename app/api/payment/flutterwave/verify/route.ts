import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderReceiptEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");
  const orderRef = searchParams.get("ref");
  const paymentType = searchParams.get("type") || "store_order";

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const secretKey = (
    process.env.FLUTTERWAVE_SECRET_KEY || 
    "FLWSECK-91ada2ac66d5d0e281300c7bc6617d58-19f671ffb44vt-X"
  ).trim();

  if (status === "cancelled") {
    if (paymentType === "store_order" && orderRef) {
      return NextResponse.redirect(`${origin}/store/order-confirmation?ref=${encodeURIComponent(orderRef)}&status=cancelled`);
    }
    return NextResponse.redirect(`${origin}/store?payment=cancelled`);
  }

  if (!transactionId || !secretKey) {
    console.error("Missing transaction ID or secret key for verification");
    return NextResponse.redirect(`${origin}/store?payment=error`);
  }

  try {
    // 1. Verify transaction directly with Flutterwave API
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${secretKey.trim()}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status !== "success" || verifyData.data?.status !== "successful") {
      console.error("Flutterwave verification unconfirmed:", verifyData);
      return NextResponse.redirect(`${origin}/store/order-confirmation?ref=${encodeURIComponent(orderRef || "")}&status=failed`);
    }

    const verifiedAmount = verifyData.data.amount;
    const resolvedOrderRef = orderRef || verifyData.data.meta?.order_ref || txRef?.split("-")[0];
    const userId = verifyData.data.meta?.user_id;

    // 2. Update Database based on payment type
    const supabase = await createClient();

    if (paymentType === "store_order" && resolvedOrderRef) {
      const { data: order } = await supabase
        .from("store_orders")
        .select("*")
        .eq("order_ref", resolvedOrderRef)
        .maybeSingle();

      const { error: updateError } = await supabase
        .from("store_orders")
        .update({
          status: "processing",
        })
        .eq("order_ref", resolvedOrderRef);

      if (updateError) {
        console.error("Failed to update store order status:", updateError);
      } else if (order && order.customer_email) {
        // Send email receipt via Resend
        sendOrderReceiptEmail({
          toEmail: order.customer_email,
          customerName: order.customer_name || "Valued Customer",
          orderRef: order.order_ref,
          items: order.items || [],
          subtotal: order.subtotal || 0,
          deliveryFee: order.delivery_fee || 2500,
          total: order.total || verifiedAmount,
          deliveryAddress: order.delivery_address || "Home Address",
        }).catch(err => console.error("Order receipt email failed:", err));
      }

      return NextResponse.redirect(
        `${origin}/store/order-confirmation?ref=${encodeURIComponent(resolvedOrderRef)}&status=paid&total=${verifiedAmount}`
      );
    }

    if (paymentType === "wallet_topup" && userId) {
      // Top up user wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (wallet) {
        const newBalance = Number(wallet.balance || 0) + Number(verifiedAmount);
        await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("id", wallet.id);

        await supabase.from("transactions").insert({
          wallet_id: wallet.id,
          amount: verifiedAmount,
          transaction_type: "credit",
          description: `Flutterwave Instant Top-up (Ref: ${transactionId})`,
          status: "success"
        });
      }

      return NextResponse.redirect(`${origin}/customer/wallet?topup=success&amount=${verifiedAmount}`);
    }

    if (paymentType === "service_request" && resolvedOrderRef) {
      await supabase
        .from("service_requests")
        .update({
          status: "in_progress",
        })
        .eq("id", resolvedOrderRef);

      return NextResponse.redirect(`${origin}/customer/dashboard?payment=success&service=${encodeURIComponent(resolvedOrderRef)}`);
    }

    if (paymentType === "pro_accreditation") {
      return NextResponse.redirect(
        `${origin}/auth/worker/register?paid=true&ref=${encodeURIComponent(transactionId || resolvedOrderRef || "")}&amount=${verifiedAmount}`
      );
    }

    if (paymentType === "inspection" && resolvedOrderRef) {
      await supabase
        .from("store_orders")
        .update({
          status: "processing",
        })
        .eq("order_ref", resolvedOrderRef);

      return NextResponse.redirect(
        `${origin}/customer/dashboard?inspection=success&ref=${encodeURIComponent(resolvedOrderRef)}&amount=${verifiedAmount}`
      );
    }

    // Default redirect to order confirmation
    return NextResponse.redirect(
      `${origin}/store/order-confirmation?ref=${encodeURIComponent(resolvedOrderRef || "")}&status=paid&total=${verifiedAmount}`
    );
  } catch (err) {
    console.error("Flutterwave verification handler error:", err);
    return NextResponse.redirect(`${origin}/store?payment=verify_failed`);
  }
}
