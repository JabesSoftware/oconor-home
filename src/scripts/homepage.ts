import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

async function loadUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(3);

  const container = document.querySelector('.events-preview-inner');
  if (!container) return;

  if (error || !data || data.length === 0) {
    // Keep placeholder if no events
    return;
  }

  container.innerHTML = `
    <h2>Upcoming Events</h2>
    ${data.map(event => `
      <div class="homepage-event-item">
        <span class="homepage-event-date">
          ${new Date(event.date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'long' })}
        </span>
        <span class="homepage-event-title">${event.title}</span>
        ${event.time ? `<span class="homepage-event-time">${event.time}</span>` : ''}
      </div>
    `).join('')}
    <p><a href="pages/events.html">View all events</a></p>
  `;
}

loadUpcomingEvents();

async function loadDonors() {
  const { data, error } = await supabase
    .from('donations')
    .select('donor_name, donor_message, consent_to_display')
    .eq('consent_to_display', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !data || data.length === 0) return;

  const grid = document.querySelector('.donor-grid');
  if (!grid) return;

  grid.innerHTML = data.map(donor => `
    <div class="donor-card">
      <span class="donor-quote">❝</span>
      <p class="donor-message">${donor.donor_message ?? 'Thank you for your generous support.'}</p>
      <p class="donor-name">— ${donor.donor_name ?? 'Anonymous'}</p>
    </div>
  `).join('');
}

loadDonors();