export const PLATFORM_TOOLS = {
  'viral-exchange': {
    name: 'Viral Exchange',
    icon: '🔄',
    desc: 'Earn credits by watching other creators videos and spend credits to promote your own content. Fair exposure for every creator.',
    longDesc: 'Join a community-driven exchange where your watch time earns real promotion credits. The more you engage, the more visibility your content gets.',
    features: ['YouTube & TikTok support', 'Credit-based promotion', 'Anti-cheat verification', 'Campaign analytics', 'Leaderboard rankings'],
    color: '#6366f1'
  },
  'feedback-exchange': {
    name: 'Feedback Exchange',
    icon: '💬',
    desc: 'Get structured peer reviews on your videos. Receive scores on hook, editing, audio, storytelling, retention, and CTA.',
    longDesc: 'Improve your content quality with anonymous, structured feedback from fellow creators. Know exactly what works and what needs improvement.',
    features: ['1-10 scoring system', 'Anonymous reviews', 'Written feedback', 'Analytics dashboard', 'Improvement tracking'],
    color: '#ec4899'
  },
  'audience-test-lab': {
    name: 'Audience Test Lab',
    icon: '🧪',
    desc: 'Test your videos before publishing. Analyze retention, test hooks, battle thumbnails, and predict viral potential.',
    longDesc: 'Professional pre-launch testing environment. Simulate audience behavior, optimize your hooks, and maximize your videos performance before going live.',
    features: ['Retention analysis', 'Hook testing', 'Thumbnail battles', 'AI viral score', 'Watch rooms'],
    color: '#14b8a6'
  }
};

export const CATEGORIES = [
  'Entertainment', 'Education', 'Gaming', 'Music', 'Sports',
  'News', 'Tech', 'Lifestyle', 'Comedy', 'DIY', 'Food', 'Travel', 'Other'
];

export const LANGUAGES = [
  'English', 'Arabic', 'Spanish', 'French', 'German', 'Portuguese',
  'Hindi', 'Japanese', 'Korean', 'Russian', 'Turkish', 'Other'
];

export const DURATION_OPTIONS = [
  { value: 15, label: '15 sec' },
  { value: 30, label: '30 sec' },
  { value: 60, label: '60 sec' },
  { value: 90, label: '90 sec' }
];

export const SESSION_OPTIONS = [
  { value: 2, label: '2 sessions' },
  { value: 4, label: '4 sessions' },
  { value: 6, label: '6 sessions' },
  { value: 8, label: '8 sessions' },
  { value: 10, label: '10 sessions' }
];

export function generateCampaignId() {
  return 'CAMP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export function generateRoomId() {
  return 'ROOM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}
