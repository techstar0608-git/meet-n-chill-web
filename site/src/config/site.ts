// Single source of truth for site-wide copy and the 3 groups.
// Edit text here — every page (home, landings, blog, footer) reads from this file.
// All copy below is PLACEHOLDER (representative text) until replaced with real content.
// Images/videos: see src/components/Media.astro — drop a file named after the slot id
// into src/assets/media/ and the placeholder frame is replaced automatically.

export const SITE = {
  name: 'Meet n Chill',
  tagline: 'Where kids, teens and young adults grow together.',
  description:
    'Meet n Chill brings people together through workshops, outdoor adventures, shared dinners, English practice and honest conversations about life and work.',
  url: 'https://meet-n-chill.tech-star0608.workers.dev',
  email: 'hello@example.com', // TODO
  // true = empty media slots show their size label (demo); false = neutral soft block
  demo: true,
  socials: [
    { label: 'Facebook', href: '#' }, // TODO
    { label: 'Instagram', href: '#' }, // TODO
  ] as { label: string; href: string }[],
  stats: [
    { value: '120+', label: 'members' },
    { value: '3', label: 'age groups' },
    { value: '50+', label: 'activities a year' },
    { value: '5', label: 'years together' },
  ],
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
  facts: { label: string; value: string }[];
  activities: { icon: string; title: string; text: string }[];
  flow: { time: string; title: string; text: string }[];
  leaders: { name: string; role: string }[];
  testimonial: { quote: string; name: string; role: string };
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
    ages: 'Ages 4–8',
    tagline: 'Play, create and learn in a safe, joyful place.',
    intro:
      'Hope Kids is where children make friends, try new things and learn through play — guided by caring teachers in a safe, supervised environment.',
    facts: [
      { label: 'Ages', value: '4–8 years' },
      { label: 'When', value: 'Saturdays, 9–11 am' },
      { label: 'Where', value: 'City centre venue' },
      { label: 'Cost', value: 'Free' },
    ],
    activities: [
      { icon: '🎨', title: 'Creative workshops', text: 'Art, crafts and hands-on projects that spark imagination.' },
      { icon: '🌳', title: 'Outdoor play', text: 'Games and small adventures in the fresh air.' },
      { icon: '📚', title: 'English through stories', text: 'Songs, stories and games that make English fun.' },
      { icon: '🤝', title: 'Friendship & values', text: 'Learning kindness, sharing and teamwork together.' },
    ],
    flow: [
      { time: '9:00', title: 'Welcome & warm-up', text: 'Name games and a song to start the morning.' },
      { time: '9:20', title: 'Story time', text: 'A short story in simple English with pictures.' },
      { time: '9:45', title: 'Workshop', text: 'Art, crafts or a small science experiment.' },
      { time: '10:30', title: 'Snack & play', text: 'Healthy snack, then games together.' },
      { time: '11:00', title: 'Pick-up', text: 'Parents collect children from the teachers.' },
    ],
    leaders: [
      { name: 'Teacher Anna', role: 'Lead teacher' },
      { name: 'Teacher Minh', role: 'Art & crafts' },
      { name: 'Teacher Lily', role: 'Stories & English' },
    ],
    testimonial: {
      quote: 'My daughter counts down the days to Saturday. She has grown so much in confidence and loves her new friends.',
      name: 'Linh',
      role: 'Parent',
    },
    schedule: 'Every Saturday, 9:00–11:00 am',
    location: 'City centre venue',
    joinUrl: '#', // TODO parent sign-up form
    joinLabel: 'Register your child',
    faq: [
      { q: 'Do parents need to stay?', a: 'Parents are welcome to stay for the first session. After that, children are cared for by our teachers.' },
      { q: 'Is there a cost?', a: 'Activities are free. Sometimes we ask for a small contribution for special trips.' },
      { q: 'How do you keep children safe?', a: 'All activities are supervised by trained teachers. We only share photos with written parent consent.' },
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
    facts: [
      { label: 'Ages', value: '9–16 years' },
      { label: 'When', value: 'Fridays, 6–8 pm' },
      { label: 'Where', value: 'Youth hall' },
      { label: 'Cost', value: 'Free' },
    ],
    activities: [
      { icon: '🛠️', title: 'Workshops', text: 'Practical skills, creativity and teamwork challenges.' },
      { icon: '🏕️', title: 'Outdoor adventures', text: 'Hikes, camps and games that build courage and friendship.' },
      { icon: '🗣️', title: 'English club', text: 'Speak up in a relaxed, encouraging group.' },
      { icon: '💬', title: 'Real talk', text: 'A safe space to talk about school, friends and growing up — with mentors who listen.' },
    ],
    flow: [
      { time: '6:00', title: 'Hang out', text: 'Games, music and catching up with friends.' },
      { time: '6:20', title: 'Challenge of the week', text: 'A team challenge or hands-on workshop.' },
      { time: '7:00', title: 'English corner', text: 'Small groups, fun topics, no pressure.' },
      { time: '7:30', title: 'Real talk', text: 'Open conversation with mentors.' },
      { time: '8:00', title: 'Home time', text: 'Parents pick up or teens head home safely.' },
    ],
    leaders: [
      { name: 'Mentor Sam', role: 'Group leader' },
      { name: 'Mentor Hoa', role: 'Outdoor adventures' },
      { name: 'Mentor Jay', role: 'English club' },
    ],
    testimonial: {
      quote: 'Ablaze is the one place where I can be myself. The camps are the best part of my year.',
      name: 'Khoa, 14',
      role: 'Ablaze member',
    },
    schedule: 'Every Friday, 6:00–8:00 pm',
    location: 'Youth hall',
    joinUrl: '#', // TODO
    joinLabel: 'Join Ablaze',
    faq: [
      { q: 'Do I need parent permission?', a: 'Yes — a parent or guardian signs the registration form for anyone under 18.' },
      { q: 'I don’t know anyone. Is that OK?', a: 'Absolutely. Most people come for the first time on their own.' },
      { q: 'Is there a cost?', a: 'Weekly meetings are free. Camps and trips have a small fee, and support is available.' },
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
    facts: [
      { label: 'Ages', value: '18–30, single' },
      { label: 'When', value: 'Tuesdays, 7–9 pm' },
      { label: 'Where', value: 'Community café' },
      { label: 'Cost', value: 'Share dinner costs' },
    ],
    activities: [
      { icon: '💡', title: 'Workshops', text: 'Career, communication and personal-growth sessions.' },
      { icon: '⛰️', title: 'Outdoor trips', text: 'Weekend hikes, picnics and day trips.' },
      { icon: '🍲', title: 'Dinner together', text: 'Cook, eat and connect around the table.' },
      { icon: '🇬🇧', title: 'English practice', text: 'Relaxed conversation groups for every level.' },
      { icon: '🧭', title: 'Life & work sharing', text: 'Bring a real question about life or work and get thoughtful advice.' },
    ],
    flow: [
      { time: '7:00', title: 'Dinner', text: 'Share a meal and meet someone new.' },
      { time: '7:40', title: 'Topic of the night', text: 'A short talk or workshop on life, work or growth.' },
      { time: '8:10', title: 'English tables', text: 'Small conversation groups by level.' },
      { time: '8:40', title: 'Sharing circle', text: 'Bring a question — listen, share, get advice.' },
      { time: '9:00', title: 'Chill', text: 'Stay for dessert, games or a walk.' },
    ],
    leaders: [
      { name: 'Leader Tuan', role: 'Community lead' },
      { name: 'Leader Mai', role: 'Workshops' },
      { name: 'Leader Chris', role: 'English tables' },
    ],
    testimonial: {
      quote: 'I moved to the city knowing nobody. Tuesday dinners gave me friends, better English and a lot of good advice.',
      name: 'Nam',
      role: 'Software engineer, 26',
    },
    schedule: 'Every Tuesday, 7:00–9:00 pm',
    location: 'Community café',
    joinUrl: '#', // TODO
    joinLabel: 'Join Young Pro',
    faq: [
      { q: 'Do I need good English?', a: 'No. All levels are welcome — that’s why we practise together.' },
      { q: 'Why “not yet married”?', a: 'Young Pro focuses on the questions of this life stage: study, first jobs, friendships and finding direction.' },
      { q: 'Is there a cost?', a: 'Only your share of dinner. Workshops and English tables are free.' },
    ],
  },
];

// Upcoming activities shown on the home page (placeholder dates).
export const EVENTS: { date: string; group: CategoryKey; title: string; place: string }[] = [
  { date: '2026-10-03', group: 'young-pro', title: 'English Dinner Night', place: 'Community café' },
  { date: '2026-10-04', group: 'hope-kids', title: 'Autumn Art Workshop', place: 'City centre venue' },
  { date: '2026-10-09', group: 'ablaze', title: 'Friday Challenge: Build a Bridge', place: 'Youth hall' },
  { date: '2026-10-18', group: 'community', title: 'Family Picnic Day', place: 'Riverside park' },
];

export const CATEGORIES: { key: CategoryKey; name: string; description: string }[] = [
  { key: 'hope-kids', name: 'Hope Kids', description: 'Stories and photos from our children’s activities.' },
  { key: 'ablaze', name: 'Ablaze', description: 'Adventures and moments from our 9–16 group.' },
  { key: 'young-pro', name: 'Young Pro', description: 'Dinners, trips, workshops and conversations from Young Pro.' },
  { key: 'community', name: 'Community', description: 'News and events for the whole Meet n Chill family.' },
];

export const getGroup = (key: string) => GROUPS.find((g) => g.key === key);
export const getCategory = (key: string) => CATEGORIES.find((c) => c.key === key);
