import { expect, describe, it } from 'vitest'
import { Chain, Handler } from './index'

describe('Chain of responsiblitiy', () => {
    it('Calling handler', () => {
        type Payload = {
            type: string
            data: string
        }
        let result: Payload | null = null
        class AHandler extends Handler<Payload> {
            protected canHandle(payload: Payload): boolean {
                if (payload.type === 'A') return true
                return false
            }
            protected _handle(payload: Payload): void {
                console.log('Handle ', payload)
                result = payload
            }
        }

        class BHandler extends Handler<Payload> {
            protected canHandle(payload: Payload): boolean {
                if (payload.type === 'B') return true
                return false
            }
            protected _handle(payload: Payload): void {
                console.log('Handle ', payload)
                result = payload
            }
        }

        class CHandler extends Handler<Payload> {
            protected canHandle(payload: Payload): boolean {
                if (payload.type === 'C') return true
                return false
            }
            protected _handle(payload: Payload): void {
                console.log('Handle ', payload)
                result = payload
            }
        }

        const aHandler = new AHandler()
        const bHandler = new BHandler()
        const cHandler = new CHandler()

        aHandler.setNext(bHandler).setNext(cHandler)

        aHandler.handle({
            type: 'C',
            data: 'Hello world',
        })
        expect(result).toEqual({
            type: 'C',
            data: 'Hello world',
        })
    })

    it('Chain should works', () => {
        type Payload = {
            type: string
            data: string
        }
        let result: Payload | null = null
        class AHandler extends Handler<Payload> {
            protected canHandle(payload: Payload): boolean {
                if (payload.type === 'A') return true
                return false
            }
            protected _handle(payload: Payload): void {
                console.log('Handle ', payload)
                result = payload
            }
        }

        class BHandler extends Handler<Payload> {
            protected canHandle(payload: Payload): boolean {
                if (payload.type === 'B') return true
                return false
            }
            protected _handle(payload: Payload): void {
                console.log('Handle ', payload)
                result = payload
            }
        }

        class CHandler extends Handler<Payload> {
            protected canHandle(payload: Payload): boolean {
                if (payload.type === 'C') return true
                return false
            }
            protected _handle(payload: Payload): void {
                console.log('Handle ', payload)
                result = payload
            }
        }

        const aHandler = new AHandler()
        const bHandler = new BHandler()
        const cHandler = new CHandler()

        const chain = new Chain([aHandler, bHandler, cHandler])
        chain.start({
            type: 'B',
            data: "I'am B",
        })
        expect(result).toEqual({
            type: 'B',
            data: "I'am B",
        })
    })
})
