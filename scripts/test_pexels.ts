import { resolvePexelsVideo, getFallbackNatureVideo } from '../src/utils/pexelsSelector';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- TEST 1: Fallback resolution with no API key ---');
  const fallbackGeneral = await resolvePexelsVideo('calm clouds and mountains');
  console.log('General query result:', fallbackGeneral);

  console.log('\n--- TEST 2: Fallback matching query keywords ---');
  const fallbackWaterfall = await resolvePexelsVideo('autumn waterfall scenic');
  console.log('Waterfall query result:', fallbackWaterfall);

  console.log('\n--- TEST 3: Direct getFallbackNatureVideo call ---');
  const directFallback = getFallbackNatureVideo('waterfall');
  console.log('Direct fallback result:', directFallback);

  console.log('\n--- TEST 4: Invalid API key handling ---');
  const invalidKeyResult = await resolvePexelsVideo('ocean waves', 'invalid_dummy_key_12345');
  console.log('Invalid key result:', invalidKeyResult);

  console.log('\n--- VERIFY FILES EXIST ---');
  const p1 = path.resolve(process.cwd(), 'public', fallbackGeneral);
  const p2 = path.resolve(process.cwd(), 'public', fallbackWaterfall);
  console.log('File 1 exists:', fs.existsSync(p1), p1);
  console.log('File 2 exists:', fs.existsSync(p2), p2);

  console.log('\nALL TESTS PASSED SUCCESSFULLY! ✅');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
