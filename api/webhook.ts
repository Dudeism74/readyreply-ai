import Stripe from "stripe";
import { createClerkClient } from "@clerk/backend";
import type { Request, Response } from "express";

// Disable default Vercel body parser to get raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY as string });

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"] as string | undefined;

  if (!sig) {
    console.error("Missing stripe-signature header");
    // Return 200 so Stripe doesn't retry endlessly as requested
    return res.status(200).send("Missing stripe-signature header"); 
  }

  try {
    const rawBody = await new Promise<Buffer>((resolve, reject) => {
      let chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;

      if (email) {
        // Look up Clerk user by email
        const users = await clerkClient.users.getUserList({ emailAddress: [email] });
        
        if (users.data && users.data.length > 0) {
          const user = users.data[0];
          
          await clerkClient.users.updateUserMetadata(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              stripeSubscriptionStatus: "active"
            }
          });
          
          console.log(`Successfully updated Clerk user ${user.id} subscription status for ${email}`);
        } else {
          console.error(`No Clerk user found with email: ${email}`);
        }
      } else {
         console.error('No email found in checkout session customer details');
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`Webhook Error:`, err);
    // Catch any errors gracefully and always return a 200 response to Stripe so it doesn't retry the webhook endlessly.
    return res.status(200).json({ error: "Webhook handled with error" });
  }
}
