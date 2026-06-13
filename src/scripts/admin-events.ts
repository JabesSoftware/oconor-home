import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.href = 'admin-login.html';
}

// ─── Logout ───────────────────────────────────────────
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'admin-login.html';
});

// ═══════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════

const eventForm = document.getElementById('add-event-form') as HTMLFormElement;
const eventTitleInput = document.getElementById('event-title') as HTMLInputElement;
const eventDateInput = document.getElementById('event-date') as HTMLInputElement;
const eventTimeInput = document.getElementById('event-time') as HTMLInputElement;
const eventLocationInput = document.getElementById('event-location') as HTMLInputElement;
const eventDescriptionInput = document.getElementById('event-description') as HTMLTextAreaElement;
const addEventError = document.getElementById('add-event-error') as HTMLDivElement;
const eventsList = document.getElementById('events-list') as HTMLDivElement;

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
    eventsList.innerHTML = '<p class="admin-loading">No events yet.</p>';
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

  document.querySelectorAll('.event-delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset['id'];
      if (confirm('Delete this event?')) {
        await supabase.from('events').delete().eq('id', id);
        loadEvents();
      }
    });
  });
}

eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  addEventError.textContent = '';
  const { error } = await supabase.from('events').insert({
    title: eventTitleInput.value,
    date: eventDateInput.value,
    time: eventTimeInput.value || null,
    location: eventLocationInput.value || null,
    description: eventDescriptionInput.value || null,
  });
  if (error) {
    addEventError.textContent = 'Error adding event.';
  } else {
    eventForm.reset();
    loadEvents();
  }
});

loadEvents();

// ═══════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════

const faqForm = document.getElementById('add-faq-form') as HTMLFormElement;
const faqCategory = document.getElementById('faq-category') as HTMLSelectElement;
const faqQuestion = document.getElementById('faq-question') as HTMLInputElement;
const faqAnswer = document.getElementById('faq-answer') as HTMLTextAreaElement;
const addFaqError = document.getElementById('add-faq-error') as HTMLDivElement;
const faqList = document.getElementById('faq-list') as HTMLDivElement;

async function loadFaqs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('category', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    faqList.innerHTML = '<p style="color:red">Error loading FAQ.</p>';
    return;
  }

  if (!data || data.length === 0) {
    faqList.innerHTML = '<p class="admin-loading">No FAQ questions yet.</p>';
    return;
  }

  faqList.innerHTML = data.map(faq => `
    <div class="event-list-item">
      <div class="event-list-item-details">
        <p style="font-size:var(--font-size-caption);color:var(--color-warmGold);font-weight:600;">${faq.category}</p>
        <h3>${faq.question}</h3>
        <p>${faq.answer}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.5rem;flex-shrink:0;">
        <button class="faq-edit-btn" data-id="${faq.id}" data-question="${encodeURIComponent(faq.question)}" data-answer="${encodeURIComponent(faq.answer)}" data-category="${faq.category}">Edit</button>
        <button class="event-delete-btn" data-id="${faq.id}">Delete</button>
      </div>
    </div>
  `).join('');

  // Delete
  document.querySelectorAll('.event-delete-btn[data-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset['id'];
      if (confirm('Delete this FAQ question?')) {
        await supabase.from('faqs').delete().eq('id', id);
        loadFaqs();
      }
    });
  });

  // Edit — pre-fill form
  document.querySelectorAll('.faq-edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = btn as HTMLElement;
      faqQuestion.value = decodeURIComponent(el.dataset['question'] || '');
      faqAnswer.value = decodeURIComponent(el.dataset['answer'] || '');
      faqCategory.value = el.dataset['category'] || 'General';
      faqForm.dataset['editId'] = el.dataset['id'];
      faqForm.querySelector('button[type="submit"]')!.textContent = 'Save Changes';
      faqQuestion.focus();
    });
  });
}

faqForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  addFaqError.textContent = '';

  console.log('FAQ submit fired');
  console.log('Edit ID:', faqForm.dataset['editId']);
  console.log('Values:', faqCategory.value, faqQuestion.value, faqAnswer.value);

  const editId = faqForm.dataset['editId'];

  if (editId) {
    // Update existing
    const { error } = await supabase.from('faqs').update({
      category: faqCategory.value,
      question: faqQuestion.value,
      answer: faqAnswer.value,
    }).eq('id', editId);

    if (error) {
      addFaqError.textContent = 'Error updating FAQ.';
    } else {
      faqForm.reset();
      delete faqForm.dataset['editId'];
      faqForm.querySelector('button[type="submit"]')!.textContent = 'Add FAQ';
      loadFaqs();
    }
  } else {
    // Insert new
   const { error } = await supabase.from('faqs').insert({
  category: faqCategory.value,
  question: faqQuestion.value,
  answer: faqAnswer.value,
});

console.log('FAQ insert error:', error);

if (error) {
  addFaqError.textContent = 'Error adding FAQ.';
    } else {
      faqForm.reset();
      loadFaqs();
    }
  }
});

loadFaqs();

// ═══════════════════════════════════════════════════════
// AVAILABILITY
// ═══════════════════════════════════════════════════════

const availabilityContainer = document.getElementById('availability-form-container') as HTMLDivElement;
const availabilityError = document.getElementById('availability-error') as HTMLDivElement;

const CARE_TYPES = [
  { key: 'rest_home', label: 'Rest Home' },
  { key: 'hospital', label: 'Hospital Level' },
  { key: 'dementia', label: 'Dementia Care' },
];

const STATUS_OPTIONS = ['Available', 'Limited', 'Waitlist'];

async function loadAvailability() {
  const { data, error } = await supabase
    .from('availability')
    .select('*');

  if (error) {
    availabilityContainer.innerHTML = '<p style="color:red">Error loading availability.</p>';
    return;
  }

  // Build a map for easy lookup
  const map: Record<string, any> = {};
  (data || []).forEach(row => { map[row.care_type] = row; });

  availabilityContainer.innerHTML = `
    <form id="availability-form">
      ${CARE_TYPES.map(ct => {
        const row = map[ct.key] || {};
        return `
          <div class="availability-admin-row">
            <h3>${ct.label}</h3>
            <div class="admin-form-row">
              <div class="form-group">
                <label>Status</label>
                <select id="avail-status-${ct.key}">
                  ${STATUS_OPTIONS.map(s => `<option value="${s}" ${row.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Note (optional)</label>
                <input type="text" id="avail-note-${ct.key}" value="${row.note || ''}" placeholder="e.g. 2 beds available" />
              </div>
            </div>
          </div>
        `;
      }).join('')}
      <div id="avail-save-msg" style="color:green;font-size:var(--font-size-caption);margin-bottom:1rem;"></div>
      <button type="submit">Save Availability</button>
    </form>
  `;

  const availForm = document.getElementById('availability-form') as HTMLFormElement;
  const saveMsg = document.getElementById('avail-save-msg') as HTMLDivElement;

  availForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveMsg.textContent = '';
    availabilityError.textContent = '';

    for (const ct of CARE_TYPES) {
      const status = (document.getElementById(`avail-status-${ct.key}`) as HTMLSelectElement).value;
      const note = (document.getElementById(`avail-note-${ct.key}`) as HTMLInputElement).value;

     console.log('Saving availability for:', ct.key, status, note);
const { error } = await supabase
  .from('availability')
        .upsert({ care_type: ct.key, status, note: note || null }, { onConflict: 'care_type' });

      if (error) {
        availabilityError.textContent = `Error saving ${ct.label}.`;
        return;
      }
    }

    saveMsg.textContent = '✓ Availability saved successfully.';
    setTimeout(() => { saveMsg.textContent = ''; }, 3000);
  });
}

loadAvailability();

// ═══════════════════════════════════════════════════════
// NEWSLETTERS
// ═══════════════════════════════════════════════════════

const newsletterForm = document.getElementById('upload-newsletter-form') as HTMLFormElement;
const newsletterTitle = document.getElementById('newsletter-title') as HTMLInputElement;
const newsletterDate = document.getElementById('newsletter-date') as HTMLInputElement;
const newsletterPdf = document.getElementById('newsletter-pdf') as HTMLInputElement;
const uploadNewsletterError = document.getElementById('upload-newsletter-error') as HTMLDivElement;

newsletterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadNewsletterError.textContent = '';

  const file = newsletterPdf.files?.[0];
  if (!file) return;

  const fileName = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('newsletters')
    .upload(fileName, file);

  if (uploadError) {
    uploadNewsletterError.textContent = 'Error uploading PDF.';
    return;
  }

  const { data: urlData } = supabase.storage.from('newsletters').getPublicUrl(fileName);

  const { error: dbError } = await supabase.from('newsletters').insert({
    title: newsletterTitle.value,
    date: newsletterDate.value,
    pdf_url: urlData.publicUrl,
  });

  if (dbError) {
    uploadNewsletterError.textContent = 'Error saving newsletter.';
  } else {
    newsletterForm.reset();
  }
});

// ═══════════════════════════════════════════════════════
// VIRTUAL TOUR VIDEO
// ═══════════════════════════════════════════════════════

const videoForm = document.getElementById('upload-video-form') as HTMLFormElement;
const tourVideo = document.getElementById('tour-video') as HTMLInputElement;
const uploadVideoError = document.getElementById('upload-video-error') as HTMLDivElement;

videoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadVideoError.textContent = '';

  const file = tourVideo.files?.[0];
  if (!file) return;

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload('virtual-tour.mp4', file, { upsert: true });

  if (uploadError) {
    uploadVideoError.textContent = 'Error uploading video.';
  } else {
    videoForm.reset();
    uploadVideoError.textContent = '';
    alert('Video uploaded successfully.');
  }
});

// ═══════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════

const documentForm = document.getElementById('upload-document-form') as HTMLFormElement;
const documentTitle = document.getElementById('document-title') as HTMLInputElement;
const documentDescription = document.getElementById('document-description') as HTMLInputElement;
const documentFile = document.getElementById('document-file') as HTMLInputElement;
const uploadDocumentError = document.getElementById('upload-document-error') as HTMLDivElement;
const documentsAdminList = document.getElementById('documents-admin-list') as HTMLDivElement;

async function loadAdminDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    documentsAdminList.innerHTML = '<p class="admin-loading">No documents yet.</p>';
    return;
  }

  documentsAdminList.innerHTML = data.map(doc => `
    <div class="event-list-item">
      <div class="event-list-item-details">
        <h3>${doc.title}</h3>
        ${doc.description ? `<p>${doc.description}</p>` : ''}
      </div>
      <button class="event-delete-btn" data-id="${doc.id}">Delete</button>
    </div>
  `).join('');

  documentsAdminList.querySelectorAll('.event-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset['id'];
      if (confirm('Delete this document?')) {
        await supabase.from('documents').delete().eq('id', id);
        loadAdminDocuments();
      }
    });
  });
}

documentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadDocumentError.textContent = '';

  const file = documentFile.files?.[0];
  if (!file) return;

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (uploadError) {
    uploadDocumentError.textContent = 'Error uploading file.';
    return;
  }

  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);

  const { error: dbError } = await supabase.from('documents').insert({
    title: documentTitle.value,
    description: documentDescription.value || null,
    file_url: urlData.publicUrl,
  });

  if (dbError) {
    uploadDocumentError.textContent = 'Error saving document.';
  } else {
    documentForm.reset();
    loadAdminDocuments();
  }
});

loadAdminDocuments();
