import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

const INITIAL_LOAD = 3;
const LOAD_MORE_COUNT = 3;
let currentlyShowing = INITIAL_LOAD;
let allNewsletters: any[] = [];

async function loadNewsletters() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('date', { ascending: false });

  const grid = document.getElementById('newsletters-grid') as HTMLDivElement;
  const loadMoreWrapper = document.getElementById('load-more-wrapper') as HTMLDivElement;

  if (error || !data || data.length === 0) {
    grid.innerHTML = '<p class="admin-loading">No newsletters available yet. Check back soon.</p>';
    return;
  }

  allNewsletters = data;
  renderNewsletters();

  if (allNewsletters.length > INITIAL_LOAD) {
    loadMoreWrapper.style.display = 'block';
  }
}

function renderNewsletters() {
  const grid = document.getElementById('newsletters-grid') as HTMLDivElement;
  const loadMoreWrapper = document.getElementById('load-more-wrapper') as HTMLDivElement;

  const visible = allNewsletters.slice(0, currentlyShowing);

  grid.innerHTML = visible.map(newsletter => `
    <div class="newsletter-card">
      ${newsletter.preview_image_url
        ? `<img src="${newsletter.preview_image_url}" alt="${newsletter.title}" class="newsletter-preview" />`
        : `<div class="newsletter-preview-placeholder">📄</div>`
      }
      <div class="newsletter-card-content">
        <p class="newsletter-card-title">${newsletter.title}</p>
        <p class="newsletter-card-date">${new Date(newsletter.date).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long' })}</p>
        <a href="${newsletter.pdf_url}" target="_blank" rel="noopener noreferrer" class="newsletter-download-btn">
          Download PDF
        </a>
      </div>
    </div>
  `).join('');

  if (currentlyShowing >= allNewsletters.length) {
    loadMoreWrapper.style.display = 'none';
  }
}

// Load more button
document.getElementById('load-more-btn')?.addEventListener('click', () => {
  currentlyShowing += LOAD_MORE_COUNT;
  renderNewsletters();
});

loadNewsletters();