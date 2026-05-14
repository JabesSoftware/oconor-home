import { createClient } from '@supabase/supabase-js';

// Redirect if not authenticated
if (sessionStorage.getItem('admin-authenticated') !== 'true') {
  window.location.href = 'admin-login.html';
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

// Elements
const form = document.getElementById('add-event-form') as HTMLFormElement;
const titleInput = document.getElementById('event-title') as HTMLInputElement;
const dateInput = document.getElementById('event-date') as HTMLInputElement;
const timeInput = document.getElementById('event-time') as HTMLInputElement;
const locationInput = document.getElementById('event-location') as HTMLInputElement;
const descriptionInput = document.getElementById('event-description') as HTMLTextAreaElement;
const addEventError = document.getElementById('add-event-error') as HTMLDivElement;
const eventsList = document.getElementById('events-list') as HTMLDivElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

// Logout
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('admin-authenticated');
  window.location.href = 'admin-login.html';
});

// Load events
async function loadEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    eventsList.innerHTML = '<p style="color:red">Error loading events.</p>';
    return;
  }

  if (!data || data.length === 0) {
    eventsList.innerHTML = '<p class="admin-loading">No events yet. Add one above.</p>';
    return;
  }

  eventsList.innerHTML = data.map(event => `
    <div class="event-list-item">
      <div class="event-list-item-details">
        <h3>${event.title}</h3>
        <p>${event.date}${event.time ? ' at ' + event.time : ''}${event.location ? ' — ' + event.location : ''}</p>
        ${event.description ? `<p>${event.description}</p>` : ''}
      </div>
      <button class="event-delete-btn" data-id="${event.id}">Delete</button>
    </div>
  `).join('');

  // Add delete listeners
  document.querySelectorAll('.event-delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset['id'];
      if (confirm('Are you sure you want to delete this event?')) {
        await supabase.from('events').delete().eq('id', id);
        loadEvents();
      }
    });
  });
}

// Add event
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const { error } = await supabase.from('events').insert({
    title: titleInput.value,
    date: dateInput.value,
    time: timeInput.value || null,
    location: locationInput.value || null,
    description: descriptionInput.value || null,
  });

  if (error) {
    addEventError.textContent = 'Error adding event. Please try again.';
    console.log(error);
  } else {
    form.reset();
    loadEvents();
  }
});

loadEvents();