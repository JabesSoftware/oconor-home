import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

const form = document.getElementById('contact-form') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const phoneInput = document.getElementById('phone') as HTMLInputElement;
const messageInput = document.getElementById('message') as HTMLTextAreaElement;
const formErrors = document.getElementById('form-errors') as HTMLDivElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { error } = await supabase.from('enquiries').insert({
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value || null,
    message: messageInput.value,
  });

  if (error) {
    console.log('Supabase error:', error);
    formErrors.textContent = 'Something went wrong. Please try again.';
  } else {
    form.innerHTML = `
      <div class="form-success">
        <h3>Thank you for getting in touch!</h3>
        <p>We'll be in contact with you shortly.</p>
      </div>
    `;
  }
});