// Extract handler return type
export type ExtractActionResponse<Action, T> = Action extends { type: T; handler: (...args: any) => infer H }
    ? H
    : never

// Extract hander parameter type
export type ExtractActionParameters<Action, T> = Action extends { type: T; handler: (...args: infer H) => any }
    ? H
    : never

export type ActionHandler<Action, T> = (...arga: ExtractActionParameters<Action, T>) => ExtractActionResponse<Action, T>

export type ExtractEventHandler<E, T> = E extends { type: T; payload: infer P }
    ? P extends unknown[]
        ? (...payload: P) => void
        : never
    : never

export type ExtractEventPayload<E, T> = E extends { type: T; payload: infer P } ? P : never

export type GenericEventHandler = (...args: unknown[]) => void

export type SelectorFunction<Args extends unknown[], Return> = (...args: Args) => Return

export type SelectorEventHandler<Return> = (newValue: Return, prevValue: Return | undefined) => void

export type ActionConstraint = {
    type: string
    handler: (...args: any) => unknown
}

export type EventConstraint = {
    type: string
    payload: unknown[]
}
type EventSubscriptionMap = Map<
    GenericEventHandler | SelectorEventHandler<unknown>,
    SelectorFunction<any, unknown> | undefined
>

type Namesapced<Name extends string, T> = T extends `${Name}:${string}` ? T : never

type NarrowToNamesapce<T, Namespace extends string> = T extends {
    type: `${Namespace}:${string}`
}
    ? T
    : never

type NarrowToAllowed<T, Allowed extends string> = T extends {
    type: Allowed
}
    ? T
    : never

export class RestrictedControllerMessenger<
    N extends string,
    Action extends ActionConstraint,
    Event extends EventConstraint,
    AllowedAction extends string,
    AllowedEvent extends string
> {
    private contollerMessenger: ControllerMessenger<ActionConstraint, EventConstraint>

    private controllerName: N

    private allowedActions: Set<AllowedAction> | null
    private allowedEvents: Set<AllowedEvent> | null

    constructor({
        controllerMessenger,
        name,
        allowedActions,
        allowedEvents,
    }: {
        controllerMessenger: ControllerMessenger<ActionConstraint, EventConstraint>
        name: N
        allowedActions?: Set<AllowedAction>
        allowedEvents?: Set<AllowedEvent>
    }) {
        this.contollerMessenger = controllerMessenger
        this.controllerName = name
        this.allowedActions = allowedActions ?? null
        this.allowedEvents = allowedEvents ?? null
    }

    registerActionHandler<T extends Namesapced<N, Action['type']>>(action: T, handler: ActionHandler<Action, T>) {
        if (!action.startsWith(`${this.controllerName}:`)) throw new Error('')
        this.contollerMessenger.registerActionHandler(action, handler)
    }

    unregisterActionHandler<T extends Namesapced<N, Action['type']>>(action: T) {
        if (!action.startsWith(`${this.controllerName}:`)) throw new Error('')
        this.contollerMessenger.unregisterActionHandler(action)
    }

    call<T extends AllowedAction & string>(actionType: T, ...params: ExtractActionParameters<Action, T>) {
        if (this.allowedActions === null) throw new Error('')
        if (!this.allowedActions.has(actionType)) throw new Error('')
        return this.contollerMessenger.call(actionType, ...params)
    }

    publish<E extends Namesapced<N, Event['type']>>(eventType: E, ...payload: ExtractEventPayload<Event, E>) {
        if (!eventType.startsWith(`${this.controllerName}:`)) throw new Error('')
        this.contollerMessenger.publish(eventType, ...payload)
    }

    subscribe<E extends AllowedEvent & string>(eventType: E, handler: ExtractEventHandler<Event, E>): void
    subscribe<E extends AllowedEvent & string, R>(
        eventType: E,
        handler: SelectorEventHandler<R>,
        selector: SelectorFunction<ExtractEventPayload<Event, E>, R>
    ): void

    subscribe<E extends AllowedEvent & string, R>(
        eventType: E,
        handler: ExtractEventHandler<Event, E>,
        selector?: SelectorFunction<ExtractEventPayload<Event, E>, R>
    ): void {
        if (this.allowedEvents === null) throw new Error('')
        if (!this.allowedEvents.has(eventType)) throw new Error('')

        if (selector) {
            return this.contollerMessenger.subscribe(eventType, handler, selector)
        }
        return this.contollerMessenger.subscribe(eventType, handler)
    }

    unsubscribe<E extends AllowedEvent & string>(eventType: E, handler: ExtractEventHandler<Event, E>) {
        if (!this.allowedEvents) throw new Error('')
        if (!this.allowedEvents.has(eventType)) throw new Error('')
        this.contollerMessenger.unsubscribe(eventType, handler)
    }

    clearEventSubscription<E extends Namesapced<N, Event['type']>>(eventType: E) {
        if (!eventType.startsWith(`${this.controllerName}:`)) throw new Error('')
        this.contollerMessenger.clearEventSubscription(eventType)
    }
}

export class ControllerMessenger<Action extends ActionConstraint, Event extends EventConstraint> {
    private _actions = new Map<Action['type'], unknown>()
    private _events = new Map<Event['type'], EventSubscriptionMap>()

    private eventPayloadCache = new Map<GenericEventHandler, unknown | undefined>()

    registerActionHandler<T extends Action['type']>(actionType: T, handler: ActionHandler<Action, T>) {
        if (this._actions.has(actionType)) throw new Error('')
        this._actions.set(actionType, handler)
    }

    unregisterActionHandler<T extends Action['type']>(actionType: T) {
        this._actions.delete(actionType)
    }

    clearActions() {
        this._actions.clear()
    }

    call<T extends Action['type']>(
        actionType: T,
        ...params: ExtractActionParameters<Action, T>
    ): ExtractActionResponse<Action, T> {
        const handler = this._actions.get(actionType) as ActionHandler<Action, T>
        if (!handler) throw new Error('')
        return handler(...params)
    }

    publish<E extends Event['type']>(eventType: E, ...payload: ExtractEventPayload<Event, E>) {
        const subscribers = this._events.get(eventType)

        if (subscribers) {
            for (const [handler, selector] of subscribers.entries()) {
                if (selector) {
                    const previousValue = this.eventPayloadCache.get(handler)
                    const newValue = selector(...payload)
                    if (newValue !== previousValue) {
                        this.eventPayloadCache.set(handler, newValue)
                        handler(newValue, previousValue)
                    }
                } else {
                    ;(handler as GenericEventHandler)(...payload)
                }
            }
        }
    }

    subscribe<E extends Event['type']>(eventType: E, handler: ExtractEventHandler<Event, E>): void

    subscribe<E extends Event['type'], R>(
        eventType: E,
        handler: SelectorEventHandler<R>,
        selector: SelectorFunction<ExtractEventPayload<Event, E>, R>
    ): void

    subscribe<E extends Event['type'], R>(
        eventType: E,
        handler: ExtractEventHandler<Event, E>,
        selector?: SelectorFunction<ExtractEventPayload<Event, E>, R>
    ): void {
        let subscribers = this._events.get(eventType)
        if (!subscribers) {
            subscribers = new Map()
            this._events.set(eventType, subscribers)
        }
        subscribers.set(handler, selector)
    }

    unsubscribe<E extends Event['type']>(eventType: E, handler: ExtractEventHandler<Event, E>) {
        const subscribers = this._events.get(eventType)
        if (!subscribers || subscribers.has(handler)) throw new Error('')
        const selector = subscribers.get(handler)

        if (selector) {
            this.eventPayloadCache.delete(handler)
        }

        subscribers.delete(handler)
    }

    clearEventSubscription<E extends Event['type']>(eventType: E) {
        this._events.delete(eventType)
    }

    clearSubscription() {
        this._events.clear()
    }

    getRestricted<N extends string, AllowedAction extends string, AllowedEvent extends string>({
        name,
        allowedActions,
        allowedEvents,
    }: {
        name: N
        allowedActions?: Set<Extract<Action['type'], AllowedAction>>
        allowedEvents?: Set<Extract<Event['type'], AllowedEvent>>
    }): RestrictedControllerMessenger<
        N,
        NarrowToNamesapce<Action, N> | NarrowToAllowed<Action, AllowedAction>,
        NarrowToNamesapce<Event, N> | NarrowToAllowed<Event, AllowedEvent>,
        AllowedAction,
        AllowedEvent
    > {
        return new RestrictedControllerMessenger<
            N,
            NarrowToNamesapce<Action, N> | NarrowToAllowed<Action, AllowedAction>,
            NarrowToNamesapce<Event, N> | NarrowToAllowed<Event, AllowedEvent>,
            AllowedAction,
            AllowedEvent
        >({
            controllerMessenger: this,
            name,
            allowedActions,
            allowedEvents,
        })
    }
}
