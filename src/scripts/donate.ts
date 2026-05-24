import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';



// Initialise Stripe
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);

// Initialise Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

// Donation tiers
const donationTiers = [
  { id: 1, amount: 10, name: "A Brick", image: "https://picsum.photos/300/200?random=30", description: "Add your name to our donor wall." },
  { id: 2, amount: 25, name: "A Cushion", image: "https://picsum.photos/300/200?random=31", description: "Help furnish a resident's room." },
  { id: 3, amount: 50, name: "A Plant", image: "https://picsum.photos/300/200?random=32", description: "Brighten our garden spaces." },
  { id: 4, amount: 100, name: "A Chair", image: "https://picsum.photos/300/200?random=33", description: "Provide comfort for a resident." },
  { id: 5, amount: 250, name: "A Bookshelf", image: "https://picsum.photos/300/200?random=34", description: "Stock our library with books and games." },
  { id: 6, amount: 500, name: "A Bed", image: "https://picsum.photos/300/200?random=35", description: "Equip a room for a new resident." },
  { id: 7, amount: 1000, name: "A Bathroom Fitout", image: "https://picsum.photos/300/200?random=36", description: "Fully fit out an accessible bathroom." },
  { id: 8, amount: 2500, name: "A Lounge Suite", image: "https://picsum.photos/300/200?random=37", description: "Furnish a communal lounge area." },
  { id: 9, amount: 5000, name: "A Nurse Station", image: "https://picsum.photos/300/200?random=38", description: "Equip a nursing station for our care team." },
  { id: 10, amount: 10000, name: "A Dementia Suite", image: "https://picsum.photos/300/200?random=39", description: "Fully fit out a dementia care suite." },
  { id: 11, amount: 25000, name: "A Ward", image: "https://picsum.photos/300/200?random=40", description: "Sponsor an entire ward in the new wing." },
  { id: 12, amount: 50000, name: "The Garden", image: "https://picsum.photos/300/200?random=41", description: "Create our therapeutic garden space." },
  { id: 13, amount: 100000, name: "A Wing", image: "https://picsum.photos/300/200?random=42", description: "Sponsor an entire wing of the new building." },
  { id: 14, amount: 250000, name: "The Building", image: "https://picsum.photos/300/200?random=43", description: "Become the principal sponsor of the entire project." },
];

// Render tiers
const tiersGrid = document.getElementById('tiers-grid') as HTMLDivElement;

tiersGrid.innerHTML = donationTiers.map(tier => `
  <div class="tier-card" data-amount="${tier.amount}" data-name="${tier.name}">
    <img src="${tier.image}" alt="${tier.name}" />
    <div class="tier-card-content">
      <p class="tier-card-name">${tier.name}</p>
      <p class="tier-card-description">${tier.description}</p>
      <p class="tier-card-amount">$${tier.amount.toLocaleString()} NZD</p>
    </div>
  </div>
`).join('');

// Handle tier selection
document.querySelectorAll('.tier-card').forEach((card) => {
  card.addEventListener('click', () => {
    // Remove selected from all cards
    document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
    
    // Select this card
    card.classList.add('selected');
    
    // Pre-fill the amount input
    const amount = (card as HTMLElement).dataset['amount'] ?? '';
    amountInput.value = amount;
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
  });
});

// Get form elements
const form = document.getElementById('donation-form') as HTMLFormElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const donorNameInput = document.getElementById('donor-name') as HTMLInputElement;
const donorEmailInput = document.getElementById('donor-email') as HTMLInputElement;
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
  donor_email: donorEmailInput.value || null,
});

    // Step 4: Show success
    form.innerHTML = '<p>Thank you for your donation! 💛</p>';
  }

  // Send thank you email
await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-donation-email`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLIC}`,
    },
    body: JSON.stringify({
  donorName: donorName || null,
  donorEmail: donorEmailInput.value || null,
  amount,
}),
  }
);
});