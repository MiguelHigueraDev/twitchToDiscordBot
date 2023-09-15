import { TextChannel } from 'discord.js';
import { node, linkedList } from '../linkedList.js';
import { conjoinedMsg, twitchMsg } from '../messageObjects.js';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

/**
 * If an error happens either on twitch or discord, print the thing
 * @param {*} error 
 */
export const genericPromiseError = (error: any) => console.error('Snap, I hit a snag... >.<', error);

const Twitch = {
    /* We need to have a non-authenciated Twitch client so that
    we can listen for messages which our authed cliient has sent
    IE: call #say w/ auth client the authed client will not get
    that message w/ the onMessage(...) event.
    but our non-authed client will get the event */
    authChatClient: null as ChatClient | null,
    anonChatClient: null as ChatClient | null,

    // Api client helps with the deletion of messages
    apiChatClient: null as ApiClient | null,
    botUserId: null as string | null,
};

const Bridge = {
    twitch: Twitch,
    MAX_MSG_CACHE: 100 as number,
    currMsgCount: 0 as number,
    targetDiscordChannel: undefined as TextChannel | undefined,
    discordTwitchCacheMap: new Map() as Map<any, any>,
    twitchMessageSearchCache: {} as { [key: string]: node<conjoinedMsg>; },
    messageLinkedListInterface: new linkedList() as linkedList<conjoinedMsg>,
};

function manageMsgCache(specificNode?: node<conjoinedMsg> | null): null | node<conjoinedMsg>
{
    if(!specificNode && Bridge.currMsgCount < Bridge.MAX_MSG_CACHE)
    {
        Bridge.currMsgCount++;
        return null;
    }

    // Delete messages once we hit our cache limit, or if we defined a node to delete, destroy that instead
    if(!specificNode)
        specificNode = Bridge.messageLinkedListInterface.beginningNode; // Garbage collection takes care of this, so need to run delete

    Bridge.messageLinkedListInterface.rebindForDelete(specificNode!);

    if(specificNode!.data?.twitchArray.length)
        for(const item of specificNode!.data.twitchArray)
        {
            Bridge.discordTwitchCacheMap.delete(item);
            Bridge.discordTwitchCacheMap.delete(item.userState.id);
        }

    if(specificNode!.data?.message)
    {
        const msg = specificNode!.data!.message;
        Bridge.discordTwitchCacheMap.delete(msg);
        Bridge.discordTwitchCacheMap.delete(msg.id);
    }

    return specificNode!;
}

/**
* @description Deletes a twitch message
* @param {twitchMsg} twitchObj A twitchMsg object.
*/
function twitchDelete(twitchObj: twitchMsg): void
{
    /* This was honestly really weird; the moderation stuff was trying to use the broadcaster ID to delete stuff
    The goal though is to have a separate bot be able to do this stuff, so the main user doesn't need to. I'm going to leave this here in case I hit it again:
    https://github.com/twurple/twurple/blob/main/docs/auth/concepts/context-switching.md */
    Bridge.twitch.apiChatClient?.asUser(Twitch.botUserId, async ctx=>
    {
        ctx.moderation.deleteChatMessages(twitchObj.userState.channelId, twitchObj.userState.id).then(undefined, genericPromiseError);
    });
}

export default Bridge;
export
{
    twitchDelete,
    manageMsgCache
};