import { createClient } from '@supabase/supabase-js';

// Redirect if not authenticated
if (sessionStorage.getItem('admin-authenticated') !== 'true') {
  window.location.href = 'admin-login.html';
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

// ─── Elements ─────────────────────────────────────────
const form = document.getElementById('story-form') as HTMLFormElement;
const formTitle = document.getElementById('story-form-title') as HTMLHeadingElement;
const storyIdInput = document.getElementById('story-id') as HTMLInputElement;
const nameInput = document.getElementById('story-name') as HTMLInputElement;
const blurbInput = document.getElementById('story-blurb') as HTMLTextAreaElement;
const bodyInput = document.getElementById('story-body') as HTMLTextAreaElement;
const photoInput = document.getElementById('story-photo') as HTMLInputElement;
const photoPreview = document.getElementById('story-photo-preview') as HTMLImageElement;
const currentPhotoUrl = document.getElementById('current-photo-url') as HTMLInputElement;
const formError = document.getElementById('story-form-error') as HTMLDivElement;
const cancelBtn = document.getElementById('story-cancel-btn') as HTMLButtonElement;
const storiesList = document.getElementById('stories-list') as HTMLDivElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

// ─── Logout ───────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('admin-authenticated');
  window.location.href = 'admin-login.html';
});

// ─── Photo preview ────────────────────────────────────
photoInput.addEventListener('change', () => {
  const file = photoInput.files?.[0];
  if (file) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreview.style.display = 'block';
  }
});

// ─── Cancel edit ─────────────────────────────────────
cancelBtn.addEventListener('click', () => {
  resetForm();
});

function resetForm() {
  form.reset();
  storyIdInput.value = '';
  currentPhotoUrl.value = '';
  photoPreview.src = '';
  photoPreview.style.display = 'none';
  formTitle.textContent = 'Add New Story';
  cancelBtn.style.display = 'none';
  formError.textContent = '';
}

// ─── Load stories ─────────────────────────────────────
async function loadStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    storiesList.innerHTML = '<p style="color:red">Error loading stories.</p>';
    return;
  }

  if (!data || data.length === 0) {
    storiesList.innerHTML = '<p class="admin-loading">No stories yet.</p>';
    return;
  }

  storiesList.innerHTML = data.map(story => `
    <div class="event-list-item">
      <div class="event-list-item-details" style="display:flex;gap:1rem;align-items:flex-start;">
        ${story.photo_url ? `<img src="${story.photo_url}" alt="${story.name}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0;" />` : ''}
        <div>
          <h3>${story.name}</h3>
          <p>${story.blurb}</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.5rem;flex-shrink:0;">
        <button class="faq-edit-btn"
          data-id="${story.id}"
          data-name="${encodeURIComponent(story.name)}"
          data-blurb="${encodeURIComponent(story.blurb)}"
          data-body="${encodeURIComponent(story.body)}"
          data-photo="${story.photo_url || ''}">Edit</button>
        <button class="event-delete-btn" data-id="${story.id}">Delete</button>
      </div>
    </div>
  `).join('');

  // Delete
  document.querySelectorAll('.event-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset['id'];
      if (confirm('Delete this story?')) {
        await supabase.from('stories').delete().eq('id', id);
        loadStories();
      }
    });
  });

  // Edit
  document.querySelectorAll('.faq-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = btn as HTMLElement;
      storyIdInput.value = el.dataset['id'] || '';
      nameInput.value = decodeURIComponent(el.dataset['name'] || '');
      blurbInput.value = decodeURIComponent(el.dataset['blurb'] || '');
      bodyInput.value = decodeURIComponent(el.dataset['body'] || '');
      currentPhotoUrl.value = el.dataset['photo'] || '';

      if (el.dataset['photo']) {
        photoPreview.src = el.dataset['photo'];
        photoPreview.style.display = 'block';
      }

      formTitle.textContent = 'Edit Story';
      cancelBtn.style.display = 'inline-block';
      nameInput.focus();
      form.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ─── Submit ───────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';

  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    let photoUrl = currentPhotoUrl.value;

    // Upload new photo if selected
    const file = photoInput.files?.[0];
    if (file) {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(fileName, file);

      if (uploadError) {
        formError.textContent = 'Error uploading photo.';
        submitBtn.disabled = false;
        submitBtn.textContent = storyIdInput.value ? 'Save Changes' : 'Add Story';
        return;
      }

      const { data: urlData } = supabase.storage
        .from('story-images')
        .getPublicUrl(fileName);
      photoUrl = urlData.publicUrl;
    }

    const storyData = {
      name: nameInput.value,
      blurb: blurbInput.value,
      body: bodyInput.value,
      photo_url: photoUrl || null,
    };

    if (storyIdInput.value) {
      // Update
      const { error } = await supabase
        .from('stories')
        .update(storyData)
        .eq('id', storyIdInput.value);

      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('stories')
        .insert(storyData);

      if (error) throw error;
    }

    resetForm();
    loadStories();

  } catch (err) {
    formError.textContent = 'Error saving story. Please try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = storyIdInput.value ? 'Save Changes' : 'Add Story';
  }
});

loadStories();
