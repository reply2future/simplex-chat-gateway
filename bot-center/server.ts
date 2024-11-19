import { GroupMemberRole, ChatType } from '@reply2future/simplex-chat/dist/command.js'
import { ChatClient } from '@reply2future/simplex-chat'
import Fastify from 'fastify'
import Cors from '@fastify/cors'

let _simplexClient: ChatClient

const fastify = Fastify({
  logger: true
})

// Register JSON parser
fastify.register(Cors)

// Health check route
fastify.get(
  '/health',
  {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  },
  async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  }
)

// invite a user to the group
fastify.post<{
  Body: { group_id: number; role: GroupMemberRole };
  Params: { contact_id: number };
}>(
  "/invite/:contact_id",
  {
    schema: {
      params: {
        type: "object",
        properties: {
          contact_id: {
            type: "number",
          },
        },
      },
      body: {
        type: "object",
        required: ["group_id"],
        properties: {
          group_id: {
            type: "number",
          },
          role: {
            type: "string",
            enum: [GroupMemberRole.GRAdmin, GroupMemberRole.GRMember],
          },
        },
      },
    },
  },
  async (request, reply) => {
    await _simplexClient.apiAddMember(
      request.body.group_id,
      request.params.contact_id,
      request.body.role || GroupMemberRole.GRMember
    );

    return {
      status: "success",
      message: "Please confirm the invitation in your account.",
    };
  }
);

// webhook for notification
fastify.post<{ Body: { message: string }, Params: { group_id: number } }>(
  '/notification/:group_id',
  {
    schema: {
      params: {
        type: 'object',
        properties: {
          group_id: {
            type: 'number'
          }
        }
      },
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' }
        }
      }
    }
  },
  async (request, reply) => {
    await _simplexClient.apiSendTextMessage(
      ChatType.Group,
      request.params.group_id,
      request.body.message
    )
    return {
      status: 'success'
    }
  }
)

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500
  reply.status(statusCode).send({
    error: error.name,
    message: error.message,
    statusCode
  })
})

export async function startServer (simplexClient: ChatClient) {
  try {
    _simplexClient = simplexClient
    await fastify.listen({ port: process.env.SERVER_PORT != null ? +process.env.SERVER_PORT : 6794, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
