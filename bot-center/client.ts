import { ChatClient } from '@reply2future/simplex-chat'
import { User } from '@reply2future/simplex-chat/dist/response.js'

let _simplexClient: ChatClient
let _user: User

async function _initSimplexChatClient (): Promise<void> {
  if (_simplexClient != null) return

  _simplexClient = await ChatClient.create(
    `ws://127.0.0.1:${process.env.GATEWAY_PORT ?? '6793'}`
  )

  _user = await _simplexClient.apiGetActiveUser() as User
  if (_user == null) throw new Error('no user profile')

  const _userAddress = await getCurrentUserAddress(_simplexClient)
  console.log(`Bot address: ${_userAddress}`)
  // enables automatic acceptance of contact connections
  await _simplexClient.enableAddressAutoAccept()
}

export async function getCurrentUserAddress (simplexClient: ChatClient): Promise<string> {

  if (simplexClient == null) {
    throw new SyntaxError('simplexClient is not initialized')
  }

  const address =
    (await simplexClient.apiGetUserAddress()) ??
    (await simplexClient.apiCreateUserAddress())
  return address
}

export async function getCurrentUser (): Promise<User> {
  if (_user != null) return _user

  await _initSimplexChatClient()
  return _user
}

export async function getSimplexChatClient (): Promise<ChatClient> {
  if (_simplexClient != null) return _simplexClient

  await _initSimplexChatClient()
  return _simplexClient
}
