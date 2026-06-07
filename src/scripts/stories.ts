import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

// ─── Modal elements ───────────────────────────────────
const modalOverlay = document.getElementById('story-modal-overlay') as HTMLDivElement;
const modalImage = document.getElementById('modal-story-image') as HTMLImageElement;
const modalTitle = document.getElementById('modal-story-title') as HTMLHeadingElement;
const modalBody = document.getElementById('modal-story-body') as HTMLDivElement;
const modalClose = document.getElementById('modal-story-close') as HTMLButtonElement;

function openModal(story: { name: string; body: string; photo_url: string | null }) {
  modalTitle.textContent = story.name;

  if (story.photo_url) {
    modalImage.src = story.photo_url;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }

  modalBody.innerHTML = story.body
    .split('\n\n')
    .map(p => `<p>${p.trim()}</p>`)
    .filter(p => p !== '<p></p>')
    .join('');

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Load stories ─────────────────────────────────────
async function loadStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: true });

  const grid = document.querySelector('.stories-grid') as HTMLDivElement;
  if (!grid) return;

  if (error || !data || data.length === 0) {
    grid.innerHTML = '<p style="color:var(--color-grey);text-align:center;padding:3rem;">No stories yet.</p>';
    return;
  }

  grid.innerHTML = data.map(story => `
    <div class="story-card" data-id="${story.id}">
      <div class="story-card-image">
        <img src="${story.photo_url || ''}" alt="${story.name}"
          onerror="this.style.display='none'" />
      </div>
      <div class="story-card-content">
        <h3>${story.name}</h3>
        <p class="story-blurb">${story.blurb}</p>
        <button class="story-read-more">Read their story</button>
      </div>
    </div>
  `).join('');

  // Attach click handlers
  grid.querySelectorAll('.story-card').forEach((card, i) => {
    card.querySelector('.story-read-more')?.addEventListener('click', () => {
      openModal(data[i]);
    });
    (card as HTMLElement).addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('story-read-more')) return;
      openModal(data[i]);
    });
  });
}

loadStories();
