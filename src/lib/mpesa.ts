// src/lib/mpesa.ts
export async function initiateMpesa(
  phone: string,
  amount: number,
  orderId: string,
) {
  const res = await fetch("/api/mpesa/stk-push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      amount,
      accountReference: orderId,
      description: `Order ${orderId}`,
      orderId,
    }),
  });

  const data = await res.json();
  return data;
}
