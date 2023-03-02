import { describe, it, expect } from 'vitest'
import { EventEmitter } from './EventEmitter'

describe('Event Emitter test', () => {
    it('Emitting', () => {
        const emitter = new EventEmitter()
        emitter.subscribe((data) => {
            console.log('Hello', data)
        })
        emitter.subscribe((data) => {
            console.log('Bye', data)
        })

        emitter.emit('Alice')
    })
})
