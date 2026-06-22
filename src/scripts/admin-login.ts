import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

// If already logged in, redirect to admin
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  window.location.href = 'admin-events.html';
}

const form = document.getElementById('login-form') as HTMLFormElement;
const emailInput = document.getElementById('login-email') as HTMLInputElement;
const passwordInput = document.getElementById('login-password') as HTMLInputElement;
const errorEl = document.getElementById('login-error') as HTMLDivElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });

  if (error) {
    errorEl.textContent = 'Incorrect email or password.';
  } else {
    window.location.href = 'admin-events.html';
  }
});
