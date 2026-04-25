// Resend is just a re-trigger of send-otp with the same rate limits.
// Implemented as a thin re-export so the frontend can use a clearer endpoint.
export { POST } from "../send-otp/route";
