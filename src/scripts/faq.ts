import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

async function loadFaqs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('category', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return;

  // Group by category
  const grouped: Record<string, any[]> = {};
  data.forEach(faq => {
    if (!grouped[faq.category]) grouped[faq.category] = [];
    grouped[faq.category].push(faq);
  });

  // Map category names to section IDs
  const sectionMap: Record<string, string> = {
    'General': 'faq-general-list',
    'Dementia Care': 'faq-dementia-list',
  };

  Object.entries(grouped).forEach(([category, faqs]) => {
    const containerId = sectionMap[category];
    if (!containerId) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = faqs.map((faq, index) => `
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          ${faq.question}
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          <p>${faq.answer}</p>
        </div>
      </div>
    `).join('');
  });

  // Re-attach accordion behaviour
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.contains('active');
      document.querySelectorAll('.faq-question').forEach(b => {
        b.classList.remove('active');
        b.nextElementSibling?.classList.remove('active');
      });
      if (!isActive) {
        btn.classList.add('active');
        btn.nextElementSibling?.classList.add('active');
      }
    });
  });
}

// Run dynamic load, fall back to static content if fails
loadFaqs();

// Static accordion fallback (for any hardcoded items)
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const isActive = btn.classList.contains('active');
    document.querySelectorAll('.faq-question').forEach(b => {
      b.classList.remove('active');
      b.nextElementSibling?.classList.remove('active');
    });
    if (!isActive) {
      btn.classList.add('active');
      btn.nextElementSibling?.classList.add('active');
    }
  });
});
