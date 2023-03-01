export abstract class Handler<P> {
    private next: Handler<P> | null = null

    setNext(next: Handler<P>): Handler<P> {
        this.next = next
        return this
    }

    handle(payload: P) {
        if (this.canHandle(payload)) this._handle(payload)
        else if (this.next) this.next.handle(payload)
        else console.log('')
    }

    protected abstract canHandle(payload: P): boolean
    protected abstract _handle(payload: P): void
}

export class Chain<P, H extends Handler<P> = Handler<P>> {
    private chains: H[]
    constructor(handlers: H[]) {
        this.chains = handlers
        this._chain()
    }

    private _chain() {
        if (this.chains.length < 2) return
        for (let i = 0; i < this.chains.length - 1; i++) {
            this.chains[i].setNext(this.chains[i + 1])
        }
    }

    start(payload: P) {
        if (this.chains.length === 0) return
        this.chains[0].handle(payload)
    }
}
