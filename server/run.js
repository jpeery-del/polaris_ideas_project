#!/usr/bin/env node
// Run this so Railway logs something before any app code runs, and we catch startup errors
console.log('Bootstrap: Node starting (server/run.js)...')

try {
  await import('./index.js')
} catch (e) {
  console.error('Startup error:', e)
  process.exit(1)
}
