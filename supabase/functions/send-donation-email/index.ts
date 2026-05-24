import "@supabase/functions-js/edge-runtime.d.ts"

const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const FROM_EMAIL = 'onboarding@resend.dev';
// TODO: Replace with real staff emails
const GENERAL_STAFF_EMAIL = 'staff@oconorhome.nz';
const LARGE_DONATION_STAFF_EMAIL = 'manager@oconorhome.nz';
const LARGE_DONATION_THRESHOLD = 1000;

Deno.serve(async (req) => {
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
    const { donorName, donorEmail, amount } = await req.json();

    const isLargeDonation = amount >= LARGE_DONATION_THRESHOLD;

    if (donorEmail) {
      // Send thank you to donor
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: donorEmail,
          subject: `Thank you for your donation to O'Conor Home`,
          html: `
            <h2>Thank you, ${donorName ?? 'Friend of O\'Conor Home'}!</h2>
            <p>Your generous donation of $${amount.toLocaleString()} NZD means the world to us and to the residents of O'Conor Home.</p>
            <p>Your contribution goes directly towards our building project — helping us provide hospital-level and dementia care for Buller's elders close to home.</p>
            <p>With gratitude,<br>The O'Conor Home Team</p>
            <!-- TODO: Add real signature, logo and branding -->
          `,
        }),
      });
    }

    if (isLargeDonation) {
      // Notify staff member for personal follow up
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: LARGE_DONATION_STAFF_EMAIL,
          subject: `Large Donation Received — Personal Thank You Required`,
          html: `
            <h2>Large Donation Alert</h2>
            <p>A significant donation has been received and requires a personal thank you.</p>
            <p><strong>Donor Name:</strong> ${donorName ?? 'Anonymous'}</p>
            <p><strong>Donor Email:</strong> ${donorEmail ?? 'Not provided'}</p>
            <p><strong>Amount:</strong> $${amount.toLocaleString()} NZD</p>
            <p>Please send a personal thank you email to this donor at your earliest convenience.</p>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});