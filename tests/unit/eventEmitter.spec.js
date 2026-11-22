import { describe, it, expect, vi } from 'vitest'
import EventEmitter from '../../src/eventEmitter'

describe('EventEmitter', () => {
  it('calls listeners with data', () => {
    const emitter = new EventEmitter()
    const a = vi.fn()
    const b = vi.fn()

    emitter.on('myEvent', a)
    emitter.on('myEvent', b)
    emitter.emit('myEvent', 'testData')
    emitter.emit('otherEvent', 'x')

    expect(a).toHaveBeenCalledTimes(1)
    expect(a).toHaveBeenCalledWith('testData')
    expect(b).toHaveBeenCalledWith('testData')
  })

  it('calls onOnce listeners only once', () => {
    const emitter = new EventEmitter()
    const once = vi.fn()
    const always = vi.fn()

    emitter.onOnce('myEvent', once)
    emitter.on('myEvent', always)
    emitter.emit('myEvent', 1)
    emitter.emit('myEvent', 2)

    expect(once).toHaveBeenCalledTimes(1)
    expect(always).toHaveBeenCalledTimes(2)
  })

  it('removes listeners with off', () => {
    const emitter = new EventEmitter()
    const listener = vi.fn()

    emitter.on('myEvent', listener)
    emitter.off('myEvent', listener)
    emitter.off('unknown', listener)
    emitter.emit('myEvent')

    expect(listener).not.toHaveBeenCalled()
  })
})
