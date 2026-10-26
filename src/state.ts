export type Station = 'brief' | 'fan' | 'window' | 'mic' | 'desk';
export type Take = { fan: boolean; construction: boolean; processed: boolean };
export type StudioState = {
  briefRead: boolean;
  fan: boolean;
  construction: boolean;
  take: Take | null;
  delivered: boolean;
};
export type Action = 'read' | 'fan' | 'quiet' | 'record' | 'process' | 'deliver';
export const initialState = (): StudioState => ({
  briefRead: false, fan: true, construction: true, take: null, delivered: false,
});
export function issues(take: Take | null): string[] {
  if (!take) return ['Record a take first.'];
  return [
    ...(take.fan ? ['The fan was running during this take.'] : []),
    ...(take.construction ? ['Construction was active during this take.'] : []),
    ...(take.processed ? ['This take was processed. The brief asks for raw audio.'] : []),
  ];
}
export function act(state: StudioState, action: Action): { state: StudioState; message: string } {
  const next = { ...state };
  if (state.delivered) return { state, message: 'Session complete. Replay the studio to try another route.' };
  switch (action) {
    case 'read':
      next.briefRead = true;
      return { state: next, message: 'Brief checked. Raw audio, a quiet capture, and a fresh take. Start by inspecting the room.' };
    case 'fan':
      next.fan = !state.fan;
      return { state: next, message: next.fan ? 'The fan is back on. A steady hum returns to the room.' : 'Fan switched off. One source of room noise is gone. Existing recordings have not changed.' };
    case 'quiet':
      next.construction = false;
      return { state: next, message: 'A quiet window is arranged with the crew next door. Now make a fresh recording.' };
    case 'record':
      if (!state.briefRead) return { state, message: 'Read the client brief before recording. It defines what this session needs.' };
      next.take = { fan: state.fan, construction: state.construction, processed: false };
      return { state: next, message: issues(next.take).length ? 'Take recorded. It is raw, but room noise is captured too. Inspect the take at the desk.' : 'Fresh raw take recorded in the quiet room. Check it at the desk, then deliver.' };
    case 'process':
      if (!state.take) return { state, message: 'There is no take to process yet. Visit the microphone to record one.' };
      next.take = { ...state.take, processed: true };
      return { state: next, message: 'This copy is now processed. Cleanup can be useful, but it conflicts with this raw-audio brief. Record a fresh take from the source.' };
    case 'deliver': {
      const problems = issues(state.take);
      if (!state.briefRead || problems.length) return { state, message: `Not ready to deliver. ${problems.join(' ') || 'Read the brief first.'}` };
      next.delivered = true;
      return { state: next, message: 'Delivered. You changed the recording conditions and made a fresh, unprocessed take.' };
    }
  }
}
