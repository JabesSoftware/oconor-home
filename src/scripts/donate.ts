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
  { id: 1, amount: 5, name: "A Brick", image: "/src/assets/images/brick_plain_thumb.png", description: "Buy a brick and help contribute to the project." },
  { id: 2, amount: 10, name: "A Brick with a name", image: "/src/assets/images/brick_thumb.png", description: "Add your name to our donor wall and help contribute to the project." },
  { id: 3, amount: 50, name: "A Plant", image: "/src/assets/images/plant_thumb.png", description: "Brighten our garden spaces." },
  { id: 4, amount: 75, name: "Bedsheets", image: "/src/assets/images/bedsheets_thumb.png", description: "Provide clean sheets for residents." },
  { id: 5, amount: 100, name: "A Dining Chair", image: "/src/assets/images/diningchair_thumb.png", description: "Provide comfort for a resident." },
  { id: 6, amount: 250, name: "An Armchair", image: "/src/assets/images/loungechair_thumb.png", description: "Help our residents sit more comfortably." },
  { id: 7, amount: 350, name: "A Bathroom Chair", image: "/src/assets/images/showerchair_thumb.png", description: "Help our residents sit more safely in the bathroom." },
  { id: 8, amount: 450, name: "A Mattress", image: "/src/assets/images/mattress_thumb.png", description: "Help our residents sleep more comfortably." },
  { id: 9, amount: 500, name: "A Bed", image: "/src/assets/images/bed_featured.png", description: "Equip a room for a new resident." },
  { id: 10, amount: 850, name: "An Armchair for the Bedroom", image: "/src/assets/images/recliner_thumb.png", description: "Help our residents sit more comfortably in privacy." },
  { id: 11, amount: 2500, name: "A Lounge Suite", image: "/src/assets/images/lounge_featured.png", description: "Furnish a communal lounge area." },
  { id: 12, amount: 5000, name: "A Hoist", image: "/src/assets/images/hoist_thumb.png", description: "Provide a new hoist for our care team to better help your loved ones." },
  { id: 13, amount: 10000, name: "A Dementia Suite", image: "/src/assets/images/ensuite_thumb.png", description: "Fully fit out a dementia care suite." },
  { id: 14, amount: 25000, name: "A Room", image: "/src/assets/images/room_featured.png", description: "Sponsor an entire room in the new building." },
  { id: 15, amount: 100000, name: "A Wing", image: "/src/assets/images/wing_cornerstone.png", description: "Sponsor an entire wing of the new building." },
  { id: 16, amount: 250000, name: "The Building", image: "/src/assets/images/flap_aerial.png", description: "Become the principal sponsor of the entire project." },
];

donationTiers.sort((a, b) => a.amount - b.amount);

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