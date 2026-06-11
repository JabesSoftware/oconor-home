import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

async function loadDocuments() {
  const list = document.getElementById('documents-list') as HTMLDivElement;

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    list.innerHTML = '<p style="color:red">Error loading documents.</p>';
    return;
  }

  if (!data || data.length === 0) {
    list.innerHTML = '<p style="color:var(--color-grey);text-align:center;padding:3rem;">No documents available yet.</p>';
    return;
  }

  list.innerHTML = data.map(doc => `
    <div class="document-item">
      <div class="document-item-icon">📄</div>
      <div class="document-item-details">
        <p class="document-item-name">${doc.title}</p>
        ${doc.description ? `<p class="document-item-description">${doc.description}</p>` : ''}
        <p class="document-item-date">${new Date(doc.created_at).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <a href="${doc.file_url}" target="_blank" rel="noopener noreferrer" class="document-download-btn">Download</a>
    </div>
  `).join('');
}

loadDocuments();
