import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

const STATUS_CLASS: Record<string, string> = {
  'Available': 'availability-card--available',
  'Limited': 'availability-card--limited',
  'Waitlist': 'availability-card--waitlist',
};

async function loadAvailability() {
  const { data, error } = await supabase
    .from('availability')
    .select('*');

  if (error || !data || data.length === 0) return;

  const map: Record<string, any> = {};
  data.forEach(row => { map[row.care_type] = row; });

  const cardMap: Record<string, string> = {
    'rest_home': 'avail-rest-home',
    'hospital': 'avail-hospital',
    'dementia': 'avail-dementia',
  };

  Object.entries(cardMap).forEach(([key, id]) => {
    const card = document.getElementById(id);
    if (!card || !map[key]) return;

    const row = map[key];
    const statusClass = STATUS_CLASS[row.status] || 'availability-card--waitlist';

    // Remove existing status classes and add new one
    card.classList.remove('availability-card--available', 'availability-card--limited', 'availability-card--waitlist');
    card.classList.add(statusClass);

    const statusEl = card.querySelector('.availability-status');
    if (statusEl) statusEl.textContent = row.status;

    const noteEl = card.querySelector('.availability-note-text');
    if (noteEl && row.note) noteEl.textContent = row.note;
  });
}

loadAvailability();
