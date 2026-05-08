import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';

console.log(import.meta.env);

// Initialise Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC;
const stripe = await loadStripe(stripePublishableKey);

// Initialise Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get form elements
const form = document.getElementById('donation-form') as HTMLFormElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const donorNameInput = document.getElementById('donor-name') as HTMLInputElement;
const donorMessageInput = document.getElementById('donor-message') as HTMLTextAreaElement;
const consentCheckbox = document.getElementById('consent') as HTMLInputElement;
const cardErrors = document.getElementById('card-errors') as HTMLDivElement;