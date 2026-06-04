// Story data
// TODO: Replace with real stories from content team
const stories: Record<string, { title: string; image: string; body: string }> = {
  "1": {
    title: "Bill Currie — \"We never had much money, but we always had plenty to eat\"",
    image: "../src/assets/images/Bill Currie.jpg",
    body: `Bill Currie has lived almost his entire life in the Buller district. At 96 years old, his memories stretch back to a time when families worked hard, wasted nothing, and built their lives with their own hands.

Bill left school young and started working part-time in a butcher shop when he was just 13 years old. He worked at the Jubilee Butchery for 22 years, learning the craft from older butchers who insisted on doing things properly.

After more than two decades, the owner even offered Bill the chance to take over the shop. But by then he had a large family — eventually nine children — and felt it was too big a responsibility.

After leaving the butchery, Bill moved to the gas works near Mill Street, where he experienced the 1968 Inangahua earthquake firsthand. "The doorway was going from one side to the other. It frightened the hell out of me."

He later worked in the boiler house at Buller Hospital for nearly two decades before retiring at 60. But retirement didn't mean stopping. "I've never stopped working. I've been working all the time."

The family lived on a five-acre block Bill transformed into productive land. "We had sheep and a big garden. We fed ourselves." They kept pigs, made their own ham and bacon, and wasted nothing.

"We never had much money, but we always had plenty to eat."`
  },
  "2": {
    title: "Claude Walsh — \"If you've got a job, work bloody hard\"",
    image: "../src/assets/images/Claude Walsh.jpg",
    body: `Claude Walsh was born in Westport on 9 January 1934, arriving not in a hospital but at home. His father worked as a butcher and managed the local Oxnam's butchery, a trade that would later become the centre of Claude's own working life.

Claude attended St Joseph's and later Buller High School. After leaving school he began working at a small shop in Derby Street before eventually joining the family trade.

Butchery was hard physical work, deeply connected to the farming and rail networks of the district. At its peak, the business handled the entire process — from livestock arriving by rail to meat being prepared and sold in the shop. Stock often arrived in railway wagons and had to be walked through town to paddocks near the abattoirs.

Claude witnessed how closely communities supported one another during the 1951 miners' strike. His family helped struggling mining families with food during that time. Years later, a man wrote to Claude's mother: "If it hadn't been for your dad's kindness giving us meat, we wouldn't have survived."

Outside work, Claude played rugby, helped organise rodeos at Cape Foulwind, and was involved with the Westport Light Horse Club. He even tried riding bucking broncos.

In his early twenties, Claude married, but tragedy struck — his wife died during childbirth, and their baby also did not survive. He never remarried.

Today Claude lives at O'Conor Home. "I enjoy it very much," he says. Without it, he may have had to leave the community he has known his entire life.

"If you've got a job, work bloody hard… and you'll get on."`
  },
  "3": {
    title: "Margaret Phipps Black — \"Go with your gut\"",
    image: "../src/assets/images/Margaret Phipps Black.jpg",
    body: `Margaret Phipps Black was born in 1962 in Kaikohe, in the Bay of Islands — the youngest of eleven children, raised in a strict Mormon household.

"I don't like conforming… I don't like people telling me what to do." At just 13 years old, Margaret left the church, setting the tone for a life lived on her own terms.

At 18 she moved to Wellington, eventually marrying and spending 35 years raising three children. After her marriage ended, her children gradually moved to the West Coast, and Margaret followed.

She worked as a preschool teacher, something she loved, and later ran a sampling team for an environmental laboratory service — driving up to eight hours a day collecting water, food, and environmental samples.

Margaret speaks openly about her struggles with alcohol dependency and the challenges that came with it. Through it all, her children remained central to her story. "You love your children until the day you die. But you've got to look after yourself too."

She has now been living at O'Conor Home for about a year. "It's my home," she says. The support she receives has helped stabilise her health and allowed her to remain connected to family and community.

"If I wasn't in here, I'd be back doing the same… I'd probably be dead, to be honest."

"Go with your gut. And don't be forced into doing something you don't want to do."`
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
      modalBody.innerHTML = story.body
  .split('\n\n')
  .map(paragraph => `<p>${paragraph.trim()}</p>`)
  .join('');
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