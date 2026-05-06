import { searchVoicings } from './src/lib/voicing-search';

try {
  const result = searchVoicings('C7M', 'cavaquinho', 4, ['D', 'G', 'B', 'D']);
  console.log('C7M Cavaquinho:', result.length, 'voicings found');
  
  const result2 = searchVoicings('D7', 'violao', 6, ['E', 'A', 'D', 'G', 'B', 'E']);
  console.log('D7 Violao:', result2.length, 'voicings found');
} catch (e) {
  console.error('Crash in searchVoicings:', e);
}
