import { ChatType } from '@reply2future/simplex-chat/dist/command.js'
import { ciContentText, ChatInfoType, GroupMemberStatus, ChatResponse } from '@reply2future/simplex-chat/dist/response.js'
import { ChatClient } from '@reply2future/simplex-chat'
import { startServer } from './server'
import { getCurrentUser, getSimplexChatClient } from './client'
import { Hanlders } from './handlers'
import { parseCommand } from './handlers/handler'

main()
  .then(() => {
    console.log('Main process started!')
  })
  .catch((e) => {
    console.error('Main process crashed!', e)
  })

const GROUPS = [
  {
    prefixName: 'Notification',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDMuNUwyLjUgMTkuNWgxOUwxMiAzLjV6bTAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGxpbmUgeDE9IjEyIiB5MT0iOSIgeDI9IjEyIiB5Mj0iMTMuNSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxNi41IiByPSIxIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L3N2Zz4='
  },
  {
    prefixName: 'Warning Room',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDNDOC43IDMgNiA1LjcgNiA5djQuOEw0LjggMTVjLS43LjctMS4xIDEuNy0xLjEgMi43YzAgMS4xLjkgMiAyIDJoMTIuNmMxLjEgMCAyLS45IDItMmMwLTEtLjQtMi0xLjEtMi43TDE4IDEzLjhWOWMwLTMuMy0yLjctNi02LTZ6bTAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTkgMTd2MWMwIDEuNyAxLjMgMyAzIDNzMy0xLjMgMy0zdi0xIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTIgMnYxIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4='
  }
]

async function initGroups (chat: ChatClient, { userId, localDisplayName }: { userId: number, localDisplayName: string }): Promise<void> {
  const allGroups = await chat.apiListGroups(userId)
  const filterGroups = allGroups.filter((v) =>
    ![GroupMemberStatus.Left, GroupMemberStatus.Deleted, GroupMemberStatus.Removed].includes(v.membership.memberStatus)
  )

  for (const { prefixName, icon } of GROUPS) {
    const _groupName = `${prefixName}#${userId}`
    const _existGroup = filterGroups.find(({ groupProfile }) => groupProfile.displayName === _groupName)
    if (_existGroup != null) {
      console.log(`group already exists: groupName - ${_groupName}, groupId - ${_existGroup.groupId}`)
      continue
    }

    const newGroup = await chat.apiNewGroup(userId, {
      displayName: _groupName,
      fullName: `${prefixName} By ${localDisplayName}`,
      image: icon
    })

    const data = {
      id: newGroup.groupId,
      name: _groupName
    }

    console.log(`group created: ${JSON.stringify(data)}`)
  }
}

async function main (): Promise<void> {
  const chat = await getSimplexChatClient()
  const user = await getCurrentUser()

  console.log(
    `Bot profile: ${user.profile.displayName} (${user.profile.fullName})`
  )

  // create groups
  await initGroups(chat, user)

  await startServer(chat)
  await processMessages(chat)

  async function processMessages (chat: ChatClient): Promise<void> {
    for await (const r of chat.msgQ) {
      const resp: ChatResponse = r instanceof Promise ? await r : r
      switch (resp.type) {
        case 'contactConnected': {
          // sends welcome message when the new contact is connected
          const { contact } = resp
          console.log(`${contact.profile.displayName} connected, contact_id: ${contact.contactId}`)
          await chat.apiSendTextMessage(
            ChatType.Direct,
            contact.contactId,
            `Hello! I am a notification bot, and your contact_id is ${contact.contactId}`
          )
          break
        }
        case 'newChatItems': {
          // deal with predefined messages
          for (const { chatInfo, chatItem } of resp.chatItems) {
            const msg = ciContentText(chatItem.content)
            if (msg == null) continue

            const { cmd, param } = parseCommand(msg)
            switch (chatInfo.type) {
              case ChatInfoType.Direct: {
                const result = await Hanlders.direct.get(cmd)?.run(param) ?? `unsupport command /${cmd}`
                await chat.apiSendTextMessage(
                  ChatType.Direct,
                  chatInfo.contact.contactId,
                  result
                )
                break
              }
              case ChatInfoType.Group: {
                const result = await Hanlders.group.get(cmd)?.run(param) ?? `unsupport command /${cmd}`
                await chat.apiSendTextMessage(
                  ChatType.Group,
                  chatInfo.groupInfo.groupId,
                  result
                )
                break
              }
              default:
                break
            }
          }
          break
        }
        // case 'receivedGroupInvitation': {
        //   // accept the invitation
        //   const groupId = resp.groupInfo.groupId
        //   await chat.apiJoinGroup(groupId)
        //   console.log(`accepted group invitation: ${groupId}`)
        //   break
        // }
      }
    }
  }
}
