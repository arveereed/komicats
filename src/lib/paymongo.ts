type PayMongoCreateCheckoutPayload = {
  data: {
    attributes: {
      billing?: {
        name?: string;
        email?: string;
        phone?: string;
      };
      cancel_url: string;
      success_url: string;
      description: string;
      line_items: Array<{
        currency: "PHP";
        amount: number;
        name: string;
        quantity: number;
        description?: string;
      }>;
      payment_method_types: string[];
      reference_number: string;
      send_email_receipt: boolean;
      show_description: boolean;
      show_line_items: boolean;
      metadata?: Record<string, string>;
    };
  };
};

type PayMongoCheckoutResponse = {
  data: {
    id: string;
    attributes: {
      checkout_url: string;
      reference_number?: string;
      payment_intent?: {
        id?: string;
      };
    };
  };
};

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

if (!PAYMONGO_SECRET_KEY) {
  throw new Error("Missing PAYMONGO_SECRET_KEY");
}

function getBasicAuthHeader() {
  const token = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64");
  return `Basic ${token}`;
}

export async function createPayMongoCheckoutSession(
  payload: PayMongoCreateCheckoutPayload,
) {
  const res = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: getBasicAuthHeader(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await res.json()) as
    | PayMongoCheckoutResponse
    | { errors?: unknown };

  if (!res.ok) {
    console.error("PayMongo checkout error:", json);
    throw new Error("Failed to create PayMongo checkout session");
  }

  return json as PayMongoCheckoutResponse;
}
