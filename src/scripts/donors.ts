import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

async function loadAllDonors() {
  const { data, error } = await supabase
    .from('donations')
    .select('donor_name, donor_message, consent_to_display')
    .eq('consent_to_display', true)
    .order('created_at', { ascending: false });

  const grid = document.getElementById('all-donors-grid') as HTMLDivElement;

  if (error || !data || data.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--color-grey)">No donors to display yet. Be the first!</p>';
    return;
  }

  grid.innerHTML = data.map(donor => `
    <div class="donor-card">
      <span class="donor-quote">❝</span>
      <p class="donor-message">${donor.donor_message ?? 'Thank you for your generous support.'}</p>
      <p class="donor-name">— ${donor.donor_name ?? 'Anonymous'}</p>
    </div>
  `).join('');
}

loadAllDonors();