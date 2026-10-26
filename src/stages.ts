// The career, left to right. Facts from Akash's CV and STORY_DRAFT.md; shared by the portfolio and the game.
export type Stage = {
  id: 'law' | 'sacac' | 'squarewave' | 'sun' | 'cop28' | 'flight' | 'kedge' | 'rouen' | 'micro1';
  title: string; place: string; years: string; story: string;
  x: number; // door position in the game world
  scene: string; // Phaser scene key of the level
};

export const stages: Stage[] = [
  {
    id: 'law', scene: 'law', title: 'Law', place: 'Jamia Millia Islamia · Supreme Court of India', years: '2016 to 2022', x: 300,
    story: 'I studied law at Jamia Millia Islamia, then worked as a junior legal assistant on intellectual-property and media-law matters at the Supreme Court of India. It taught me to read closely and check what the evidence actually supports.',
  },
  {
    id: 'sacac', scene: 'sacac', title: 'The calling', place: 'Sri Aurobindo Centre for Arts & Communication (SACAC)', years: '2022 to 2023', x: 560,
    story: 'Music was always my first calling. I left law and enrolled at SACAC for a diploma in audio engineering and music production.',
  },
  {
    id: 'squarewave', title: 'Get it right at the source', place: 'Square Wave Studios, New Delhi', years: '2022 to 2023', x: 820, scene: 'studio',
    story: 'At Square Wave Studios, I worked on recording, editing and dialogue production. On one speech-recording project, the client needed raw audio. Our team changed the recording process and re-recorded problematic takes instead of cleaning them afterward. The right sound depends on the brief.',
  },
  {
    id: 'sun', scene: 'sun', title: 'Big stages', place: 'Sun Infonet, Mumbai', years: '2023 to 2024', x: 1130,
    story: "As an application engineer at Sun Infonet, I supported Meyer Sound, Shure and Allen & Heath systems and trained integrators and audio professionals. I supported Ed Sheeran's Mathematics Tour in Mumbai and Lollapalooza Mumbai.",
  },
  {
    id: 'cop28', scene: 'cop28', title: 'Be ready before it breaks', place: 'COP28, Dubai', years: '2023', x: 1450,
    story: 'At COP28, I coordinated audio across more than 50 simultaneous podiums with broadcast, interpretation, IT and venue teams. I noticed signs of RF interference in monitoring, and our team switched to a prepared backup before it reached the main broadcast feed.',
  },
  {
    id: 'flight', scene: 'flight', title: 'Delhi to Paris', place: 'Indira Gandhi International Airport, New Delhi', years: '2024', x: 1700,
    story: "In 2024 I left Delhi for Paris to start a master's degree in France.",
  },
  {
    id: 'kedge', scene: 'kedge', title: 'Study the industry', place: 'KEDGE Business School, Paris', years: '2024 to 2026', x: 1980,
    story: 'I studied for an MSc in Arts & Creative Industries Management at KEDGE Business School. My thesis looked at sound engineering, AI in music and sonic translation.',
  },
  {
    id: 'rouen', scene: 'rouen', title: 'Listen to a place', place: 'Rouen Normandie Tourisme, Rouen', years: '2025 to 2026', x: 2250,
    story: 'As sound designer and production coordinator with Rouen Normandie Tourisme, I recorded the city, built the Rouen Sound Library and sound content for Seine Rise, and edited and restored the recordings. I worked between the city, museum and agency teams to turn creative briefs into delivered audio.',
  },
  {
    id: 'micro1', scene: 'micro1', title: 'Explain what you hear', place: 'micro1, remote from Paris', years: '2026 to now', x: 2500,
    story: "I evaluate AI-generated conversational audio at micro1, first as an expert and now as a reviewer. I compare voices for naturalness, quality, timing and prosody, write evidence-based feedback, and review other evaluators' judgments.",
  },
];

export const brief = 'Client brief: raw speech only. No post-processing or noise reduction. Background noise must be low. Record fresh takes where needed.';
