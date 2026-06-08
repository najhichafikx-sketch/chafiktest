export const PLATFORM_TOOLS = {
  'viral-exchange': {
    name: 'Viral Exchange',
    icon: '🔄',
    desc: 'Earn credits by watching and reviewing videos. Spend credits to get your content seen. Self-sustaining credit economy for creators.',
    longDesc: 'A community-driven feedback platform where you exchange views, feedback, and audience testing. Watch videos to earn credits, submit your content to get exposure and reviews.',
    features: ['Credit-based economy', 'Structured feedback scoring', 'Smart video distribution', 'Anti-abuse system', 'Analytics dashboard'],
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
    desc: 'Bandwidth-efficient pre-launch video testing. Analyze retention, test hooks, battle thumbnails, and predict viral potential.',
    longDesc: 'Professional pre-launch testing environment with optimized bandwidth usage. Videos start muted and low quality. Test audience behavior before publishing.',
    features: ['Bandwidth-efficient playback', 'Retention analysis', 'Hook testing', 'Thumbnail battles', 'AI viral score'],
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

export const FEEDBACK_CATEGORIES = [
  { id: 'hook', label: 'Hook Quality' },
  { id: 'editing', label: 'Editing' },
  { id: 'audio', label: 'Audio' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'retention', label: 'Retention' },
  { id: 'cta', label: 'CTA' }
];

export const REQUEST_TYPES = [
  { id: 'audience_feedback', label: 'Audience Feedback', icon: '👥' },
  { id: 'hook_testing', label: 'Hook Testing', icon: '🪝' },
  { id: 'thumbnail_testing', label: 'Thumbnail Testing', icon: '🖼️' },
  { id: 'retention_analysis', label: 'Retention Analysis', icon: '📈' },
  { id: 'general', label: 'General Review', icon: '💬' }
];

export const VIDEO_TYPES = [
  { id: 'youtube', label: 'YouTube Video' },
  { id: 'shorts', label: 'YouTube Shorts' },
  { id: 'tiktok', label: 'TikTok' }
];
