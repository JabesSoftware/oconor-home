// Story data
// TODO: Replace with real stories from content team
const stories: Record<string, { title: string; image: string; body: string }> = {
  "1": {
    title: "Margaret's Story",
    image: "https://picsum.photos/600/400?random=1",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  },
  "2": {
    title: "The Walsh Family",
    image: "https://picsum.photos/600/400?random=2",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  },
  "3": {
    title: "Patrick's Journey",
    image: "https://picsum.photos/600/400?random=3",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  },
  "4": {
    title: "The O'Brien Family",
    image: "https://picsum.photos/600/400?random=4",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  }
};

// Get modal elements
const modal = document.getElementById('story-modal') as HTMLDivElement;
const modalTitle = document.getElementById('modal-title') as HTMLHeadingElement;
const modalBody = document.getElementById('modal-body') as HTMLParagraphElement;
const modalImage = document.getElementById('modal-image') as HTMLImageElement;
const modalClose = document.getElementById('modal-close') as HTMLButtonElement;

// Open modal when card button is clicked
document.querySelectorAll('.story-read-more').forEach((button) => {
  button.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('[data-story]') as HTMLElement;
    const storyId = card.dataset['story'] ?? '';
    const story = stories[storyId];

    if (story) {
      modalTitle.textContent = story.title;
      modalBody.textContent = story.body;
      modalImage.src = story.image;
      modal.classList.add('active');
    }
  });
});

// Close modal
modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Close on overlay click
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// Close on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.classList.remove('active');
  }
});