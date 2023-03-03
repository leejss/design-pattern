export type Listener<T> = (state: T) => void

export interface BaseConfig {
    disabled?: boolean
}

export interface BaseState {
    name?: string
}

export type UpdateOptions = {
    overwrite?: boolean
}

export type ConfigureOptions = {
    overwrite?: boolean
    fullUpdate?: boolean
}

export class BaseContoller<Config extends BaseConfig, State extends BaseState> {
    defaultConfig: Config = {} as Config
    defaultState: State = {} as State

    disabled = false

    name = 'BaseController'

    private readonly initialConfig: Config
    private readonly initialState: State

    private _config: Config = this.defaultConfig
    private _state: State = this.defaultState

    private listeners = new Set<Listener<State>>()

    constructor(config: Partial<Config> = {}, state: Partial<State> = {}) {
        this.initialConfig = config as Config
        this.initialState = state as State
    }

    get config() {
        return this._config
    }

    get state() {
        return this._state
    }

    protected initialize() {
        this._config = this.defaultConfig
        this._state = this.defaultState

        this.configure(this.initialConfig)
        this.update(this.initialState)
        return this
    }

    configure(
        config: Partial<Config>,
        options: ConfigureOptions = {
            overwrite: false,
            fullUpdate: true,
        }
    ) {
        const { fullUpdate, overwrite } = options
        if (fullUpdate) {
            this._config = overwrite ? (config as Config) : Object.assign(this._config, config)
            for (const key in this._config) {
                if (typeof this._config[key] !== 'undefined') {
                    ;(this as any)[key as string] = this._config[key]
                }
            }
        } else {
            for (const key in config) {
                if (typeof this._config[key] !== 'undefined') {
                    this._config[key] = config[key] as any
                    ;(this as any)[key as string] = config[key]
                }
            }
        }
    }

    update(state: Partial<State>, options: UpdateOptions = { overwrite: false }) {
        const { overwrite } = options
        this._state = overwrite ? Object.assign({}, state as State) : Object.assign({}, this._state, state)

        this.notify()
    }

    notify() {
        if (this.disabled) return
        for (const listener of this.listeners) {
            listener(this._state)
        }
    }

    subsribe(listener: Listener<State>) {
        this.listeners.add(listener)
    }

    unsubscribe(listener: Listener<State>) {
        this.listeners.delete(listener)
    }
}

export default BaseContoller
