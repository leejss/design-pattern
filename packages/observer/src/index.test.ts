import { describe, expect, it } from 'vitest'
import { Observer, Subject } from './index'

describe('Observer Test', () => {
    it('Basic observer test', () => {
        class LogObserver extends Observer<unknown> {
            public handle(data: unknown): void {
                console.log(data)
            }
        }

        class Log2Observer extends Observer<unknown> {
            public handle(data: unknown): void {
                console.log('Log2', data)
            }
        }

        const subject = new Subject<unknown>()
        const logObserver1 = new LogObserver()
        const logObserver2 = new Log2Observer()

        subject.subscribe(logObserver1)
        subject.subscribe(logObserver2)

        subject.emit('Hello World!')

        subject.unsubscribe(logObserver1)

        subject.emit('Bye')
    })
})
