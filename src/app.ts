import fastify from 'fastify'
import { ZodError, z } from 'zod'
import { env } from './env'
import { appRoutes } from './http/routes'

export const app = fastify()

app.register(appRoutes)

app.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
        return reply.status(400).send({
            message: 'Validation error.',
            issues: z.treeifyError(error),
        })
    }

    if (env.NODE_ENV !== 'production') {
        console.error(error)
    } else {
        //TODO: Here we should log to an external tool like Datadog, New Relic, Sentry.
    }

    return reply.status(500).send({
        message: 'Internal server error.',
    })
})
