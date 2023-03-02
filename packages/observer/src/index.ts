export abstract class Observer<P> {
    public abstract handle(data: P): void
}

export class Subject<P> {
    protected observers: Set<Observer<P>> = new Set()

    public subscribe(observer: Observer<P>) {
        this.observers.add(observer)
    }

    public unsubscribe(observer: Observer<P>) {
        if (!this.observers.has(observer)) throw new Error('No observer')
        this.observers.delete(observer)
    }

    public emit(data: P) {
        for (const observer of this.observers) {
            observer.handle(data)
        }
    }
}
