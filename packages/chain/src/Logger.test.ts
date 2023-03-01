import { describe, it } from 'vitest'
import { logger } from './Logger'

describe('Logger test', () => {
    it('logger', () => {
        logger.start({
            type: 'warn',
            message: 'Warning 🔥🔥🔥🔥',
        })
    })
})
