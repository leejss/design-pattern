type Observer = (data: unknown) => void

export class EventEmitter {
    private observers: Set<Observer> = new Set()

    subscribe(observer: Observer) {
        this.observers.add(observer)
    }

    unsubscribe(observer: Observer) {
        if (!this.observers.has(observer)) throw new Error('No observer')
        this.observers.delete(observer)
    }

    emit(event: unknown) {
        for (const observer of this.observers) {
            observer(event)
        }
    }
}
