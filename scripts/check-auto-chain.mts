// Run: npm run check — the panel's Transition and Duration must reach the auto-chain.
import assert from 'node:assert/strict'
import { autoChainDefaults } from '../src/core/transitions.ts'

assert.deepEqual(autoChainDefaults({ transitionType: 'DISSOLVE', duration: 0.6 }).type, 'DISSOLVE')
assert.equal(autoChainDefaults({ transitionType: 'DISSOLVE', duration: 0.6 }).duration, 0.6)
assert.equal(autoChainDefaults().type, 'SMART_ANIMATE')
assert.equal(autoChainDefaults().duration, 0.45)
assert.equal(autoChainDefaults({ duration: NaN }).duration, 0.45) // empty Duration field: parseInt('') / 1000
assert.equal(autoChainDefaults({ duration: 0 }).duration, 0.45)
assert.equal(autoChainDefaults({ duration: 99.999 }).duration, 2) // typed past the field's max
console.log('auto-chain defaults OK')
