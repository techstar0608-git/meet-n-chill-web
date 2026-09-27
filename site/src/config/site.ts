// Single source of truth for site-wide copy and the 3 groups.
// Edit text here — every page (home, landings, blog, footer) reads from this file.
// Lines marked TODO still hold placeholder copy / links.

export const SITE = {
  name: 'Meet n Chill',
  tagline: 'A friendly community where kids, teens and young professionals grow together.', // TODO confirm
  description:
    'Meet n Chill brings people together through workshops, outdoor adventures, shared dinners, English practice and honest conversations about life and work.', // TODO confirm
  url: 'https://example.com', // TODO replace with the real domain once connected to Cloudflare
  email: 'hello@example.com', // TODO
  socials: [
    // TODO add real links, e.g. { label: 'Facebook', href: 'https://facebook.com/...' }
  ] as { label: string; href: string }[],
};

export type GroupKey = 'hope-kids' | 'ablaze' | 'young-pro';
export type CategoryKey = GroupKey | 'community';

export interface Group {
  key: GroupKey;
  code: 'HK' | 'AB' | 'YP';
  name: string;
  ages: string;
  tagline: string;
  intro: string;
  activities: { icon: string; title: string; text: string }[];
  schedule: string;
  location: string;
  joinUrl: string;
  joinLabel: string;
  faq: { q: string; a: string }[];
}

export const GROUPS: Group[] = [
  {
    key: 'hope-kids',
    code: 'HK',
    name: 'Hope Kids',
    ages: 'Children', // TODO exact age range, e.g. "Ages 4–8"
    tagline: 'Play, create and learn in a safe, joyful place.',
    intro:
      'Hope Kids is where children make friends, try new things and learn through play — guided by caring teachers in a safe environment.',
    activities: [
      { icon: '🎨', title: 'Creative workshops', text: 'Art, crafts and hands-on projects that spark imagination.' },
      { icon: '🌳', title: 'Outdoor play', text: 'Games and small adventures in the fresh air.' },
      { icon: '📚', title: 'English through stories', text: 'Songs, stories and games that make English fun.' },
      { icon: '🤝', title: 'Friendship & values', text: 'Learning kindness, sharing and teamwork together.' },
    ],
    schedule: 'TODO: e.g. Every Saturday, 9:00–11:00 am',
    location: 'TODO: venue / area (no private addresses)',
    joinUrl: '#', // TODO parent sign-up form
    joinLabel: 'Register your child',
    faq: [
      { q: 'Do parents need to stay?', a: 'TODO' },
      { q: 'Is there a cost?', a: 'TODO' },
      { q: 'How do you keep children safe?', a: 'All activities are supervised by our teachers. We only share photos with written parent consent.' },
    ],
  },
  {
    key: 'ablaze',
    code: 'AB',
    name: 'Ablaze',
    ages: 'Ages 9–16',
    tagline: 'Discover your spark — adventures, friends and real conversations.',
    intro:
      'Ablaze is for pre-teens and teens who want to explore, build confidence and find friends who lift them up.',
    activities: [
      { icon: '🛠️', title: 'Workshops', text: 'Practical skills, creativity and teamwork challenges.' },
      { icon: '🏕️', title: 'Outdoor adventures', text: 'Hikes, camps and games that build courage and friendship.' },
      { icon: '🗣️', title: 'English club', text: 'Speak up in a relaxed, encouraging group.' },
      { icon: '💬', title: 'Real talk', text: 'Safe space to talk about school, friends and growing up — with mentors who listen.' },
    ],
    schedule: 'TODO: e.g. Every Friday, 6:00–8:00 pm',
    location: 'TODO',
    joinUrl: '#', // TODO
    joinLabel: 'Join Ablaze',
    faq: [
      { q: 'Do I need parent permission?', a: 'Yes — a parent or guardian signs the registration form for anyone under 18.' },
      { q: 'I don’t know anyone. Is that OK?', a: 'Absolutely. Most people come for the first time on their own.' },
      { q: 'Is there a cost?', a: 'TODO' },
    ],
  },
  {
    key: 'young-pro',
    code: 'YP',
    name: 'Young Pro',
    ages: 'Ages 18–30 · single',
    tagline: 'Meet people, practise English, share life — over good food.',
    intro:
      'Young Pro is a community for young professionals and students (18–30, not yet married) who want real friendships, growth and honest conversations.',
    activities: [
      { icon: '💡', title: 'Workshops', text: 'Career, communication and personal-growth sessions.' },
      { icon: '⛰️', title: 'Outdoor trips', text: 'Weekend hikes, picnics and day trips.' },
      { icon: '🍲', title: 'Dinner together', text: 'Cook, eat and connect around the table.' },
      { icon: '🇬🇧', title: 'English practice', text: 'Relaxed conversation groups for every level.' },
      { icon: '🫶', title: 'Life & work sharing', text: 'Bring a real question about life or work and get thoughtful advice.' },
    ],
    schedule: 'TODO: e.g. Every Tuesday, 7:00–9:00 pm',
    location: 'TODO',
    joinUrl: '#', // TODO
    joinLabel: 'Join Young Pro',
    faq: [
      { q: 'Do I need good English?', a: 'No. All levels are welcome — that’s why we practise together.' },
      { q: 'Why “not yet married”?', a: 'Young Pro focuses on the questions of this life stage: study, first jobs, friendships and finding direction.' },
      { q: 'Is there a cost?', a: 'TODO (e.g. shared dinner costs only)' },
    ],
  },
];

export const CATEGORIES: { key: CategoryKey; name: string; description: string }[] = [
  { key: 'hope-kids', name: 'Hope Kids', description: 'Stories and photos from our children’s activities.' },
  { key: 'ablaze', name: 'Ablaze', description: 'Adventures and moments from our 9–16 group.' },
  { key: 'young-pro', name: 'Young Pro', description: 'Dinners, trips, workshops and conversations from Young Pro.' },
  { key: 'community', name: 'Community', description: 'News and events for the whole Meet n Chill family.' },
];

export const getGroup = (key: string) => GROUPS.find((g) => g.key === key);
export const getCategory = (key: string) => CATEGORIES.find((c) => c.key === key);
