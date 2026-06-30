import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';

// Initialise Stripe
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC) as Stripe;

// Initialise Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

// ─── Stripe card element ──────────────────────────────
const elements = stripe.elements();
const cardElement = elements.create('card', {
  style: {
    base: {
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '15px',
      color: '#333333',
      '::placeholder': { color: '#DDA8B5' },
    },
    invalid: { color: '#e74c3c' },
  }
});
cardElement.mount('#modal-card-element');

// ─── Modal elements ───────────────────────────────────
const overlay = document.getElementById('stripe-modal-overlay') as HTMLDivElement;
const closeBtn = document.getElementById('stripe-modal-close') as HTMLButtonElement;
const modalItemName = document.getElementById('stripe-modal-item-name') as HTMLParagraphElement;
const modalAmount = document.getElementById('stripe-modal-amount') as HTMLParagraphElement;
const modalBtnAmount = document.getElementById('modal-btn-amount') as HTMLSpanElement;
const modalForm = document.getElementById('stripe-modal-form') as HTMLFormElement;
const modalSuccess = document.getElementById('modal-success') as HTMLDivElement;
const modalCardErrors = document.getElementById('modal-card-errors') as HTMLDivElement;
const modalSubmitBtn = document.getElementById('modal-submit-btn') as HTMLButtonElement;
const modalDonorName = document.getElementById('modal-donor-name') as HTMLInputElement;
const modalDonorEmail = document.getElementById('modal-donor-email') as HTMLInputElement;
const modalDonorMessage = document.getElementById('modal-donor-message') as HTMLTextAreaElement;
const modalConsent = document.getElementById('modal-consent') as HTMLInputElement;

let currentAmount = 0;

// ─── Open modal when a menu card is clicked ───────────
const STRIPE_LIVE = false; // flip to true once Stripe is turned on

document.querySelectorAll('.menu-item[data-amount]').forEach((card) => {
  card.addEventListener('click', (e) => {
    e.preventDefault();

    if (!STRIPE_LIVE) {
      alert('Card donations are coming soon! For now, please use the GiveALittle button below or make a direct bank transfer to support this item.');
      return;
    }

    const amount = parseFloat((card as HTMLElement).dataset.amount || '0');
    const name = (card as HTMLElement).dataset.name || 'Donation';
    openModal(amount, name);
  });
});

function openModal(amount: number, itemName: string) {
  currentAmount = amount;
  const formatted = amount >= 1000
    ? `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
    : `$${amount.toLocaleString()}`;

  modalItemName.textContent = itemName;
  modalAmount.textContent = formatted;
  modalBtnAmount.textContent = formatted;

  // Reset form state
  modalForm.style.display = 'flex';
  modalSuccess.style.display = 'none';
  modalCardErrors.textContent = '';
  modalSubmitBtn.disabled = false;
  modalSubmitBtn.textContent = `Donate ${formatted}`;
  modalDonorName.value = '';
  modalDonorEmail.value = '';
  modalDonorMessage.value = '';
  modalConsent.checked = false;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Handle payment submission ────────────────────────
modalForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  modalSubmitBtn.disabled = true;
  modalSubmitBtn.textContent = 'Processing...';
  modalCardErrors.textContent = '';

  try {
    // Step 1: Create payment intent via Supabase edge function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLIC}`,
        },
        body: JSON.stringify({ amount: currentAmount }),
      }
    );

    const { clientSecret, error: intentError } = await response.json();

    if (intentError) {
      throw new Error(intentError);
    }

    // Step 2: Confirm card payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement as StripeCardElement }
    });

    if (result.error) {
      modalCardErrors.textContent = result.error.message ?? 'Payment failed';
      modalSubmitBtn.disabled = false;
      modalSubmitBtn.textContent = `Donate $${currentAmount.toLocaleString()}`;
      return;
    }

    // Step 3: Save to Supabase
    await supabase.from('donations').insert({
      amount: currentAmount,
      donor_name: modalDonorName.value || null,
      donor_email: modalDonorEmail.value || null,
      donor_message: modalDonorMessage.value || null,
      consent_to_display: modalConsent.checked,
      stripe_payment_id: result.paymentIntent.id,
    });

    // Step 4: Send thank you email if email provided
    if (modalDonorEmail.value) {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-donation-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLIC}`,
          },
          body: JSON.stringify({
            donor_name: modalDonorName.value || 'Anonymous',
            donor_email: modalDonorEmail.value,
            amount: currentAmount,
          }),
        }
      );
    }

    // Step 5: Show success
    modalForm.style.display = 'none';
    modalSuccess.style.display = 'flex';

  } catch (err) {
    modalCardErrors.textContent = 'Something went wrong. Please try again.';
    modalSubmitBtn.disabled = false;
    modalSubmitBtn.textContent = `Donate $${currentAmount.toLocaleString()}`;
  }
});

console.log('Cards found:', document.querySelectorAll('.menu-item[data-amount]').length);