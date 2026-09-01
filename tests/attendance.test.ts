import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { canSkip, mustAttend, overall, percent, standing } from '../shared/attendance.ts'
import type { Subject } from '../shared/types.ts'

const make = (attended: number, missed: number, requirement = 75): Subject => ({
  id: 'x',
  name: 'Test',
  code: '',
  accent: 'lime',
  attended,
  missed,
  requirement,
  createdAt: 0,
})

test('percent handles the empty case without dividing by zero', () => {
  assert.equal(percent(make(0, 0)), 0)
  assert.equal(percent(make(3, 1)), 75)
})

test('canSkip counts only classes you can miss and stay at the requirement', () => {
  // 18/20 = 90%. Skipping 4 gives 18/24 = 75%, exactly the line; a 5th drops below.
  assert.equal(canSkip(make(18, 2)), 4)
  assert.equal(canSkip(make(3, 1)), 0)
  assert.equal(canSkip(make(9, 5)), 0)
})

test('mustAttend counts the classes needed to climb back', () => {
  // 9/14 = 64%. Six in a row gives 15/20 = 75%.
  assert.equal(mustAttend(make(9, 5)), 6)
  assert.equal(mustAttend(make(18, 2)), 0)
})

test('canSkip and mustAttend agree at the boundary', () => {
  for (let attended = 0; attended <= 30; attended++) {
    for (let missed = 0; missed <= 10; missed++) {
      const s = make(attended, missed)
      const skip = canSkip(s)
      if (skip > 0) {
        const after = percent(make(attended, missed + skip))
        assert.ok(after >= s.requirement - 1e-9, `skipping ${skip} should stay above the line`)
        const tooFar = percent(make(attended, missed + skip + 1))
        assert.ok(tooFar < s.requirement, 'one more skip should drop below the line')
      }
      const need = mustAttend(s)
      if (need > 0 && need !== Infinity) {
        const after = percent(make(attended + need, missed))
        assert.ok(after >= s.requirement - 1e-9, `attending ${need} should reach the line`)
      }
    }
  }
})

test('standing reports the right tone', () => {
  assert.equal(standing(make(0, 0)).tone, 'empty')
  assert.equal(standing(make(18, 2)).tone, 'safe')
  assert.equal(standing(make(9, 5)).tone, 'risk')
  assert.equal(standing(make(3, 1)).tone, 'edge')
})

test('overall aggregates across subjects', () => {
  const stats = overall([make(18, 2), make(9, 5)])
  assert.equal(stats.attended, 27)
  assert.equal(stats.missed, 7)
  assert.equal(stats.atRisk, 1)
  assert.equal(Math.round(stats.percent), 79)
})
