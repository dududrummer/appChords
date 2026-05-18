import { searchVoicings } from './src/lib/arpeggio-search';

console.log(JSON.stringify(searchVoicings('C', { instrument: 'cavaquinho', tuning: ['D', 'G', 'B', 'D'] }), null, 2));
