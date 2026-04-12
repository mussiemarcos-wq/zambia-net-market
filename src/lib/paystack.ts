// DPO Pay (formerly PayGate) - Zambia payment provider
// Docs: https://developers.dpogroup.com/

const DPO_COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN || "";
const DPO_SERVICE_TYPE = process.env.DPO_SERVICE_TYPE || "5525"; // Default service type
const DPO_API_URL = "https://secure.3gdirectpay.com/API/v6/";
const DPO_PAY_URL = "https://secure.3gdirectpay.com/payv2.php";

interface DPOTokenResponse {
  success: boolean;
  transToken: string;
  transRef: string;
  error?: string;
}

interface DPOVerifyResponse {
  success: boolean;
  transactionStatus: string; // "1" = approved, "2" = declined, "0" = pending
  transactionAmount: string;
  transactionCurrency: string;
  customerEmail: string;
  transRef: string;
  error?: string;
}

// Create a payment token with DPO
async function createToken({
  amount,
  reference,
  email,
  callbackUrl,
  description,
}: {
  amount: number; // in ZMW (e.g., 50 for K50)
  reference: string;
  email: string;
  callbackUrl: string;
  description: string;
}): Promise<DPOTokenResponse> {
  const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>ZMW</PaymentCurrency>
    <CompanyRef>${reference}</CompanyRef>
    <RedirectURL>${callbackUrl}</RedirectURL>
    <BackURL>${callbackUrl}</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>24</PTL>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${DPO_SERVICE_TYPE}</ServiceType>
      <ServiceDescription>${description}</ServiceDescription>
      <ServiceDate>${new Date().toISOString().split("T")[0]}</ServiceDate>
    </Service>
  </Services>
  <Additional>
    <CustomerEmail>${email}</CustomerEmail>
  </Additional>
</API3G>`;

  try {
    const res = await fetch(DPO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlPayload,
    });
    const text = await res.text();

    const transToken = extractXML(text, "TransToken");
    const transRef = extractXML(text, "TransRef");
    const resultCode = extractXML(text, "Result");

    if (resultCode === "000" && transToken) {
      return { success: true, transToken, transRef: transRef || reference };
    }

    const resultExplanation = extractXML(text, "ResultExplanation");
    return {
      success: false,
      transToken: "",
      transRef: "",
      error: resultExplanation || "Failed to create payment token",
    };
  } catch (err) {
    return {
      success: false,
      transToken: "",
      transRef: "",
      error: err instanceof Error ? err.message : "Payment request failed",
    };
  }
}

// Verify a payment by its token
async function verifyToken(transToken: string): Promise<DPOVerifyResponse> {
  const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${transToken}</TransactionToken>
</API3G>`;

  try {
    const res = await fetch(DPO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlPayload,
    });
    const text = await res.text();

    const resultCode = extractXML(text, "Result");
    const transStatus = extractXML(text, "TransactionStatusCode");
    const transAmount = extractXML(text, "TransactionAmount");
    const transCurrency = extractXML(text, "TransactionCurrency");
    const customerEmail = extractXML(text, "CustomerEmail");
    const transRef = extractXML(text, "CompanyRef");

    return {
      success: resultCode === "000",
      transactionStatus: transStatus || "0",
      transactionAmount: transAmount || "0",
      transactionCurrency: transCurrency || "ZMW",
      customerEmail: customerEmail || "",
      transRef: transRef || "",
    };
  } catch (err) {
    return {
      success: false,
      transactionStatus: "0",
      transactionAmount: "0",
      transactionCurrency: "ZMW",
      customerEmail: "",
      transRef: "",
      error: err instanceof Error ? err.message : "Verification failed",
    };
  }
}

function extractXML(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1] : "";
}

// ─── Public API (same interface as before, so no other files need changing) ───

export async function initializePayment({
  email,
  amount,
  reference,
  callbackUrl,
  metadata,
}: {
  email: string;
  amount: number; // in ngwee (smallest unit, 100 ngwee = K1)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const amountZMW = amount / 100; // convert ngwee to ZMW
  const description = metadata?.type
    ? `Zambia.net Marketplace ${metadata.type} - ${metadata.planId || "payment"}`
    : "Zambia.net Marketplace Payment";

  const result = await createToken({
    amount: amountZMW,
    reference,
    email,
    callbackUrl,
    description,
  });

  if (!result.success) {
    return {
      status: false,
      message: result.error || "Payment initialization failed",
      data: { authorization_url: "", access_code: "", reference },
    };
  }

  return {
    status: true,
    message: "Payment initialized",
    data: {
      authorization_url: `${DPO_PAY_URL}?ID=${result.transToken}`,
      access_code: result.transToken,
      reference,
    },
  };
}

export async function verifyPayment(reference: string) {
  // DPO uses transToken for verification, which we store as providerRef
  // But we can also look it up by reference
  const { prisma } = await import("./db");
  const payment = await prisma.payment.findFirst({
    where: { id: reference },
    select: { providerRef: true },
  });

  const transToken = payment?.providerRef || reference;
  const result = await verifyToken(transToken);

  // Status "1" = approved in DPO
  const isSuccess = result.transactionStatus === "1";

  return {
    status: true,
    message: isSuccess ? "Payment successful" : "Payment not completed",
    data: {
      status: isSuccess ? "success" : "failed",
      reference,
      amount: parseFloat(result.transactionAmount) * 100, // back to ngwee
      currency: result.transactionCurrency,
      customer: { email: result.customerEmail },
      metadata: {},
    },
  };
}

export function validateWebhookSignature(_body: string, _signature: string): boolean {
  // DPO uses URL callbacks rather than webhook signatures
  // Verification is done by calling verifyToken directly
  return true;
}
