import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLIC
);

async function loadVideo() {
  const { data } = await supabase.storage.from('videos').list();
  const container = document.getElementById('video-container') as HTMLDivElement;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="video-placeholder">
        <p>🎥 Video walkthrough coming soon.</p>
        <p>In the meantime, contact us to arrange an in-person visit.</p>
        <a href="contact.html" class="btn-primary">Book a Visit</a>
      </div>
    `;
    return;
  }

  const video = data[0];
  const { data: urlData } = supabase.storage.from('videos').getPublicUrl(video.name);

  container.innerHTML = `
    <video 
      controls 
      width="100%" 
      style="border-radius:8px;max-height:500px;background:#000"
    >
      <source src="${urlData.publicUrl}" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  `;
}

loadVideo();