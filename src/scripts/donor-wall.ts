import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

async function loadDonors() {
  const { data, error } = await supabase
    .from('donations')
    .select('donor_name, donor_message, consent_to_display')
    .eq('consent_to_display', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.log('Error loading donors:', error);
    return;
  }

  const grid = document.querySelector('.donor-grid');
  if (!grid) return;

  if (!data || data.length === 0) {
    // Keep placeholder cards if no real donors yet
    return;
  }

  // Replace placeholder cards with real donor data
  grid.innerHTML = data.map(donor => `
    <div class="donor-card">
      <span class="donor-quote">❝</span>
      <p class="donor-message">${donor.donor_message ?? 'Thank you for your generous support.'}</p>
      <p class="donor-name">— ${donor.donor_name ?? 'Anonymous'}</p>
    </div>
  `).join('');
}

loadDonors();