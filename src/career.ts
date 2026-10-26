// Public career copy. Source: STORY_DRAFT.md. Only reviewed wording goes here.
export type Chapter = { id: string; title: string; period: string; card: string; playable: boolean };

export const chapters: Chapter[] = [
  {
    id: 'law', title: 'Law: look closely', period: '2021 to 2022', playable: false,
    card: 'I began in legal work, supporting research, drafting and document review in intellectual-property and media-law matters. It trained me to look carefully at what the evidence supports.',
  },
  {
    id: 'studio', title: 'Studio: get it right at the source', period: 'Square Wave Studios, 2022 to 2023', playable: true,
    card: 'At Square Wave Studios, I worked on recording, editing and dialogue production. On one speech-recording project, the client needed raw audio. Our team changed the recording process and re-recorded problematic takes instead of cleaning them afterward. The right sound depends on the brief.',
  },
  {
    id: 'live', title: 'Live sound: be ready before it breaks', period: 'Sun Infonet and COP28, 2023 to 2024', playable: false,
    card: 'As an application engineer, I worked on professional audio systems, technical support and training. At COP28, I noticed signs of RF interference in monitoring. Our team used a prepared backup before it reached the main broadcast feed.',
  },
  {
    id: 'france', title: 'France: listen to a place', period: 'KEDGE and Rouen, 2024 to 2026', playable: false,
    card: "I moved to France for a master's in Arts and Creative Industries Management. In Rouen, my work included field recording, editing and organising sound assets for a place-based sound project.",
  },
  {
    id: 'ai', title: 'AI review: explain what you hear', period: 'Now', playable: false,
    card: 'I now work on AI evaluation and review. I listen for issues, check decisions against the applicable guidance, and explain my reasoning clearly.',
  },
];

export const brief = 'Fictional client brief: raw speech only. No post-processing or noise reduction. Background noise must be low. Record fresh takes where needed.';
