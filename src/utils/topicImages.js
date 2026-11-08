/**
 * Topic Image Selector & Curated Educational Photography
 * Maps topics and keywords to rich, high-resolution photography.
 */

export const TOPIC_COLLECTIONS = {
  frontend: {
    name: 'Frontend & Web Architecture',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop&q=80',
    badge: 'Code & Systems'
  },
  systems: {
    name: 'Distributed Systems & Cloud',
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    badge: 'Infrastructure'
  },
  biology: {
    name: 'Life Sciences & Bioenergetics',
    cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&auto=format&fit=crop&q=80',
    badge: 'Bio Sciences'
  },
  neuroscience: {
    name: 'Cognitive Science & Psychology',
    cover: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&auto=format&fit=crop&q=80',
    badge: 'Cognition'
  },
  general: {
    name: 'Academic Mastery',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80',
    badge: 'Deep Study'
  }
};

export function getTopicVisuals(topic = '', title = '') {
  const combined = `${topic} ${title}`.toLowerCase();

  if (combined.includes('react') || combined.includes('javascript') || combined.includes('frontend') || combined.includes('code') || combined.includes('fiber')) {
    return TOPIC_COLLECTIONS.frontend;
  }
  if (combined.includes('system') || combined.includes('cap') || combined.includes('distributed') || combined.includes('database') || combined.includes('network') || combined.includes('cloud')) {
    return TOPIC_COLLECTIONS.systems;
  }
  if (combined.includes('bio') || combined.includes('cell') || combined.includes('atp') || combined.includes('respiration') || combined.includes('mitochond') || combined.includes('medicine')) {
    return TOPIC_COLLECTIONS.biology;
  }
  if (combined.includes('brain') || combined.includes('psych') || combined.includes('neuro') || combined.includes('memory') || combined.includes('cognit')) {
    return TOPIC_COLLECTIONS.neuroscience;
  }
  return TOPIC_COLLECTIONS.general;
}
