import { ChatClient } from '@reply2future/simplex-chat'
import { User } from "@reply2future/simplex-chat/dist/response.js";

let _simplexClient: ChatClient
let _user: User
let _userAddress

async function _initSimplexChatClient (): Promise<void> {
  if (_simplexClient) return

  _simplexClient = await ChatClient.create(
    `ws://127.0.0.1:${process.env.GATEWAY_PORT || '6793'}`
  )

  _user = await _simplexClient.apiGetActiveUser() as User
  if (!_user) throw new Error('no user profile')

  _userAddress =
    (await _simplexClient.apiGetUserAddress()) ||
    (await _simplexClient.apiCreateUserAddress())
  console.log(`Bot address: ${_userAddress}`)
  // enables automatic acceptance of contact connections
  await _simplexClient.enableAddressAutoAccept()
}

export async function getCurrentUser (): Promise<User> {
  if (_user) return _user

  await _initSimplexChatClient()
  return _user
}

export async function getSimplexChatClient (): Promise<ChatClient> {
  if (_simplexClient) return _simplexClient

  await _initSimplexChatClient()
  return _simplexClient
}
