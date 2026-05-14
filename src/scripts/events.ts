import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

async function loadEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });

  const container = document.getElementById('events-container') as HTMLDivElement;

  if (error || !data) {
    container.innerHTML = '<p class="no-events">Unable to load events.</p>';
    return;
  }

  if (data.length === 0) {
    container.innerHTML = '<p class="no-events">No upcoming events at this time. Check back soon.</p>';
    return;
  }

  container.innerHTML = data.map(event => `
    <div class="event-card">
      <h3>${event.title}</h3>
      <p class="event-meta">
        📅 ${new Date(event.date).toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        ${event.time ? '· 🕐 ' + event.time : ''}
        ${event.location ? '· 📍 ' + event.location : ''}
      </p>
      ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
    </div>
  `).join('');
}

loadEvents();