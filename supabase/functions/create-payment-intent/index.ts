import "@supabase/functions-js/edge-runtime.d.ts"

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  try {
    const { amount } = await req.json();
console.log('Received amount:', amount);

    // Create payment intent with Stripe
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(amount * 100), // Convert to cents
        currency: 'nzd',
        'automatic_payment_methods[enabled]': 'true',
      }).toString(),
    });

    const paymentIntent = await response.json();
    console.log('Stripe response:', JSON.stringify(paymentIntent));

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
} catch (error) {
  console.log('Error:', error);
  return new Response(JSON.stringify({ error: String(error) }), {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
});