import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';

// Initialise Stripe
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);

// Initialise Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

// Get form elements
const form = document.getElementById('donation-form') as HTMLFormElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const donorNameInput = document.getElementById('donor-name') as HTMLInputElement;
const donorMessageInput = document.getElementById('donor-message') as HTMLTextAreaElement;
const consentCheckbox = document.getElementById('consent') as HTMLInputElement;
const cardErrors = document.getElementById('card-errors') as HTMLDivElement;

// Set up Stripe card element
const elements = stripe!.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = parseFloat(amountInput.value);
  const donorName = donorNameInput.value;
  const donorMessage = donorMessageInput.value;
  const consentToDisplay = consentCheckbox.checked;

  // Step 1: Create payment intent via edge function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLIC}`,
      },
      body: JSON.stringify({ amount }),
    }
  );

const responseText = await response.text();
console.log('Raw response:', responseText);
const responseData = JSON.parse(responseText);
const { clientSecret } = responseData;
console.log('Client secret:', clientSecret);

  // Step 2: Confirm payment with Stripe
  const result = await stripe!.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement }
  });

  if (result.error) {
    cardErrors.textContent = result.error.message ?? 'Payment failed';
  } else {
    // Step 3: Save to Supabase
    await supabase.from('donations').insert({
      amount,
      donor_name: donorName || null,
      donor_message: donorMessage || null,
      consent_to_display: consentToDisplay,
      stripe_payment_id: result.paymentIntent.id,
    });

    // Step 4: Show success
    form.innerHTML = '<p>Thank you for your donation! 💛</p>';
  }
});