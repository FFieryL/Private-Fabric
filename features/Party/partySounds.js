import c from "../../config"
import { registerPacketChat } from "../../util/Events"
import { chat, playSound } from "../../util/utils";

registerPacketChat((message) => {
    if (!c.partyInviteSound && !c.partyJoinSound) return;
    if (c.partyInviteSound && (/^-+\n.*? has invited you to join their party!\nYou have 60 seconds to accept\. Click here to join!\n-+$/.test(message)
        || /^-+\n.*? has invited you to join .*?'s party!\nYou have 60 seconds to accept\. Click here to join!\n-+$/.test(message))) {

        playSound(c.partyInviteSoundType ?? "entity.cat.ambient", c.partyInviteSoundVolume, c.partyInviteSoundPitch / 100);
    }

    else if (c.partyJoinSound && (message.match(/^Party Finder > \w{3,16} joined the dungeon group! \(\w+ Level \d{1,2}\)$/) || message.match(/^Party Finder > \w{3,16} joined the group! \(\w+ Level \d{1,2}\)$/))) {
        playSound(c.partyJoinSoundType, c.partyJoinSoundVolume, c.partyJoinSoundPitch / 100)
    }
    
})
