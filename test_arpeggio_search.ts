import { searchVoicings } from './src/lib/arpeggio-search';

console.log(JSON.stringify(searchVoicings('G7', { instrument: 'cavaquinho', tuning: ['D', 'G', 'B', 'D'] }), null, 2));
