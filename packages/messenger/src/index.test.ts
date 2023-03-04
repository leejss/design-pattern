import { expect, describe, it } from 'vitest'
import { ControllerMessenger } from './index'

describe('ControllerMessenger', () => {
    it('should allow registering and calling an action hanlder', () => {
        type CounterAction = {
            type: 'count'
            handler: (inc: number) => void
        }
        const C = new ControllerMessenger<CounterAction, never>()

        let count = 0

        C.registerActionHandler('count', (inc) => {
            count += inc
        })
        C.call('count', 1)
        expect(count).toBe(1)
    })

    it('should allow registering and calling multiple differenet action handlers', () => {
        type GetOtherState = {
            type: 'OtherController:getState'
            handler: () => { mesage: string }
        }

        type OtherStateChaange = {
            type: 'OtherController:stateChange'
            payload: [{ message: string }]
        }

        type MessageAction =
            | { type: 'concat'; handler: (message: string) => void }
            | { type: 'reset'; handler: (message: string) => void }

        const C = new ControllerMessenger<MessageAction | GetOtherState, OtherStateChaange>()
        let message = ''

        C.registerActionHandler('reset', (msg) => {
            message = msg
        })

        C.registerActionHandler('concat', (msg: string) => {
            message += msg
        })

        C.call('reset', 'hello')
        C.call('concat', 'world')
        expect(message).toBe('helloworld')

        type IncrementAciton = {
            type: 'increment'
            handler: () => void
        }

        const I = new ControllerMessenger<IncrementAciton, never>()
        let count = 0
        I.registerActionHandler('increment', () => {
            count += 1
        })
        I.call('increment')
        expect(count).toBe(1)
    })

    it('should allow registering and calling an action hnadler with multiple paramters', () => {
        const balances: Record<string, number> = {}
        type TransacitonAction = {
            type: 'transaction'
            handler: (to: string, value: number) => void
        }

        const C = new ControllerMessenger<TransacitonAction, never>()
        C.registerActionHandler('transaction', (to, value) => {
            balances[to] = balances[to] ? balances[to] + value : value
        })
        C.call('transaction', 'Alice', 1000)

        expect(balances).toStrictEqual({
            Alice: 1000,
        })
    })
})
