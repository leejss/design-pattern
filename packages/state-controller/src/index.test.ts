import { BaseContoller, type BaseConfig, type BaseState } from './index'
import { describe, it, expect } from 'vitest'
import * as sinon from 'sinon'

class TestController extends BaseContoller<BaseConfig, BaseState> {
    constructor(config?: BaseConfig, state?: BaseState) {
        super(config, state)
        this.initialize()
    }
}

describe('BaseContoller', () => {
    it('should set initial state', () => {
        const controller = new TestController(undefined, { name: 'hello' })
        expect(controller.state).toStrictEqual({ name: 'hello' })
    })
    it('should set initial config', () => {
        const controller = new TestController({ disabled: true })
        expect(controller.config).toStrictEqual({ disabled: true })
    })

    it('should overwrite state', () => {
        const controller = new TestController({ disabled: true })
        expect(controller.state).toStrictEqual({})
        controller.update({
            name: 'hello!',
        })
        expect(controller.state).toStrictEqual({ name: 'hello!' })
    })
    it('should overwrite config', () => {
        const controller = new TestController()
        expect(controller.config).toStrictEqual({})
        controller.configure({
            disabled: true,
        })
        expect(controller.config).toStrictEqual({ disabled: true })
    })

    it('should notify all listeners', () => {
        const controller = new TestController(undefined, { name: 'hello' })
        const l1 = sinon.stub()
        const l2 = sinon.stub()
        controller.subsribe(l1)
        controller.subsribe(l2)
        controller.notify()
        expect(l1.calledOnce).toBe(true)
        expect(l2.calledOnce).toBe(true)
    })
})
