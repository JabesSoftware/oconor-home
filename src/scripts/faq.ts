document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling as HTMLElement;
    const isActive = button.classList.contains('active');

    // Close all open items
    document.querySelectorAll('.faq-question').forEach((q) => {
      q.classList.remove('active');
      (q.nextElementSibling as HTMLElement).classList.remove('active');
    });

    // Open clicked item if it wasn't already open
    if (!isActive) {
      button.classList.add('active');
      answer.classList.add('active');
    }
  });
});