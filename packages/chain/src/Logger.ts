import { Chain, Handler } from './index'

type Log = {
    type: 'info' | 'warn' | 'error'
    message: any
}

export class InfoHandler extends Handler<Log> {
    protected _handle(payload: Log): void {
        console.log('[Info]', payload.message)
    }
    protected canHandle(payload: Log): boolean {
        return payload.type === 'info'
    }
}
export class WarnHandler extends Handler<Log> {
    protected _handle(payload: Log): void {
        console.log('[Warn]', payload.message)
    }
    protected canHandle(payload: Log): boolean {
        return payload.type === 'warn'
    }
}

export class ErrorHandler extends Handler<Log> {
    protected _handle(payload: Log): void {
        console.log('[Error]', payload.message)
    }
    protected canHandle(payload: Log): boolean {
        return payload.type === 'error'
    }
}

export const logger = new Chain<Log>([new InfoHandler(), new WarnHandler(), new ErrorHandler()])
