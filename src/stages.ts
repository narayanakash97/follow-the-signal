// The career, left to right. Facts from Akash's CV and STORY_DRAFT.md; shared by the portfolio and the game.
export type Stage = {
  id: 'law' | 'sacac' | 'squarewave' | 'sun' | 'cop28' | 'paris';
  title: string; place: string; years: string; story: string;
  x: number; // door position in the game world
  scene?: 'studio'; // mini-game; undefined = story card only, for now
};

export const stages: Stage[] = [
  {
    id: 'law', title: 'Law', place: 'Jamia Millia Islamia · Supreme Court of India', years: '2016 to 2022', x: 300,
    story: 'I studied law at Jamia Millia Islamia, then worked as a junior legal assistant on intellectual-property and media-law matters at the Supreme Court of India. It taught me to read closely and check what the evidence actually supports.',
  },
  {
    id: 'sacac', title: 'The calling', place: 'Sri Aurobindo Centre for Arts & Communication (SACAC)', years: '2022 to 2023', x: 560,
    story: 'Music was always my first calling. I left law and enrolled at SACAC for a diploma in audio engineering and music production.',
  },
  {
    id: 'squarewave', title: 'Get it right at the source', place: 'Square Wave Studios, New Delhi', years: '2022 to 2023', x: 820, scene: 'studio',
    story: 'At Square Wave Studios, I worked on recording, editing and dialogue production. On one speech-recording project, the client needed raw audio. Our team changed the recording process and re-recorded problematic takes instead of cleaning them afterward. The right sound depends on the brief.',
  },
  {
    id: 'sun', title: 'Big stages', place: 'Sun Infonet, Mumbai', years: '2023 to 2024', x: 1130,
    story: "As an application engineer at Sun Infonet, I supported Meyer Sound, Shure and Allen & Heath systems and trained integrators and audio professionals. I supported Ed Sheeran's Mathematics Tour in Mumbai and Lollapalooza Mumbai.",
  },
  {
    id: 'cop28', title: 'Be ready before it breaks', place: 'COP28, Dubai', years: '2023', x: 1450,
    story: 'At COP28, I coordinated audio across more than 50 simultaneous podiums with broadcast, interpretation, IT and venue teams. I noticed signs of RF interference in monitoring, and our team switched to a prepared backup before it reached the main broadcast feed.',
  },
  {
    id: 'paris', title: 'Explain what you hear', place: 'KEDGE Business School · micro1, Paris', years: '2024 to now', x: 1880,
    story: "I flew from Delhi to Paris for an MSc in Arts & Creative Industries Management at KEDGE Business School. Today I review AI audio at micro1: I listen for issues, check them against the guidance, and explain my reasoning clearly.",
  },
];

export const brief = 'Client brief: raw speech only. No post-processing or noise reduction. Background noise must be low. Record fresh takes where needed.';
