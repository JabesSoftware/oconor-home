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


// Newsletter upload
const uploadForm = document.getElementById('upload-newsletter-form') as HTMLFormElement;
const newsletterTitle = document.getElementById('newsletter-title') as HTMLInputElement;
const newsletterDate = document.getElementById('newsletter-date') as HTMLInputElement;
const newsletterPdf = document.getElementById('newsletter-pdf') as HTMLInputElement;
const uploadError = document.getElementById('upload-newsletter-error') as HTMLDivElement;
const uploadProgress = document.getElementById('upload-progress') as HTMLDivElement;

async function loadNewsletters() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('date', { ascending: false });

  const list = document.getElementById('newsletters-list') as HTMLDivElement;

  if (error || !data || data.length === 0) {
    list.innerHTML = '<p class="admin-loading">No newsletters yet. Upload one above.</p>';
    return;
  }

  list.innerHTML = data.map(newsletter => `
    <div class="event-list-item">
      <div class="event-list-item-details">
        <h3>${newsletter.title}</h3>
        <p>${new Date(newsletter.date).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long' })}</p>
      </div>
      <div style="display:flex;gap:0.5rem">
        <a href="${newsletter.pdf_url}" target="_blank" class="btn-primary" style="font-size:var(--font-size-caption);padding:0.4rem 0.75rem">View</a>
        <button class="newsletter-delete-btn event-delete-btn" data-id="${newsletter.id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.newsletter-delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset['id'];
      if (confirm('Are you sure you want to delete this newsletter?')) {
        await supabase.from('newsletters').delete().eq('id', id);
        loadNewsletters();
      }
    });
  });
}

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadError.textContent = '';
  uploadProgress.style.display = 'block';

  const file = newsletterPdf.files?.[0];
  if (!file) {
    uploadError.textContent = 'Please select a PDF file.';
    uploadProgress.style.display = 'none';
    return;
  }

  // Upload PDF to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('newsletters')
    .upload(fileName, file);

  if (uploadErr) {
    uploadError.textContent = 'Error uploading file. Please try again.';
    uploadProgress.style.display = 'none';
    console.log(uploadErr);
    return;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('newsletters')
    .getPublicUrl(fileName);

  // Save to database
  const { error: dbError } = await supabase.from('newsletters').insert({
    title: newsletterTitle.value,
    date: newsletterDate.value,
    pdf_url: urlData.publicUrl,
  });

  if (dbError) {
    uploadError.textContent = 'Error saving newsletter. Please try again.';
    uploadProgress.style.display = 'none';
    console.log(dbError);
    return;
  }

  uploadProgress.style.display = 'none';
  uploadForm.reset();
  loadNewsletters();
});

loadNewsletters();

// Video upload
const videoForm = document.getElementById('upload-video-form') as HTMLFormElement;
const videoFile = document.getElementById('video-file') as HTMLInputElement;
const videoError = document.getElementById('upload-video-error') as HTMLDivElement;
const videoProgress = document.getElementById('upload-video-progress') as HTMLDivElement;
const currentVideo = document.getElementById('current-video') as HTMLDivElement;

async function loadCurrentVideo() {
  const { data } = await supabase.storage.from('videos').list();
  
  if (!data || data.length === 0) {
    currentVideo.innerHTML = '<p class="admin-loading">No video uploaded yet.</p>';
    return;
  }

  const video = data[0];
  const { data: urlData } = supabase.storage.from('videos').getPublicUrl(video.name);

  currentVideo.innerHTML = `
    <div class="event-list-item">
      <div class="event-list-item-details">
        <h3>Current Video</h3>
        <p>${video.name}</p>
      </div>
      <div style="display:flex;gap:0.5rem">
        <a href="${urlData.publicUrl}" target="_blank" class="btn-primary" style="font-size:var(--font-size-caption);padding:0.4rem 0.75rem">Preview</a>
        <button class="event-delete-btn" id="delete-video-btn" data-name="${video.name}">Delete</button>
      </div>
    </div>
  `;

  document.getElementById('delete-video-btn')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete the current video?')) {
      await supabase.storage.from('videos').remove([video.name]);
      loadCurrentVideo();
    }
  });
}

videoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  videoError.textContent = '';
  videoProgress.style.display = 'block';

  const file = videoFile.files?.[0];
  if (!file) {
    videoError.textContent = 'Please select a video file.';
    videoProgress.style.display = 'none';
    return;
  }

  // Delete existing video first
  const { data: existing } = await supabase.storage.from('videos').list();
  if (existing && existing.length > 0) {
    await supabase.storage.from('videos').remove(existing.map(f => f.name));
  }

  // Upload new video
  const fileName = `tour-video-${Date.now()}.mp4`;
  const { error: uploadErr } = await supabase.storage
    .from('videos')
    .upload(fileName, file);

  if (uploadErr) {
    videoError.textContent = 'Error uploading video. Please try again.';
    videoProgress.style.display = 'none';
    console.log(uploadErr);
    return;
  }

  videoProgress.style.display = 'none';
  videoForm.reset();
  loadCurrentVideo();
});

loadCurrentVideo();