import PogObject from "../../../PogData";
import { chat, ChatMessageC2SPacket, getColorCodes, playSound } from "../../util/utils";
import WebSocketPASF from "../../util/websocket";
import c from "../../config"
const WS_URL = "wss://private-irc.onrender.com/?user=" + encodeURIComponent(Player.getName());

const ircData = new PogObject("PrivateASF-Fabric",{color: "&5", fulldisable: false}, "data/irc_data.json");

let myWS = null;
let username = Player.getName();
let color = ircData.color;
let inIRC = false;
let manuallyDisabled = false;
let noSoundNext = false;

const WS_STATE = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2
}

let wsState = WS_STATE.DISCONNECTED;
let reconnectTimer = null;

const helpMsg = [
    "&d&lPA IRC &7Commands (Use &5/pac &7or &5/pairc&7):",
    "&5/pac &7- Switch to IRC chat channel",
    "&5/pac toggle &7- Enable/disable IRC",
    "&5/pac color <color> &7- Change name color",
    "&5/pac online &7- Show online users"
].join("\n");

function ircChat(msg) {
    ChatLib.chat(`&l&0PA IRC&7 >> ${msg}`);
    if (!noSoundNext && c.ircChatSound) playSound(c.ircChatSoundType, c.ircChatSoundVolume / 100, c.ircChatSoundPitch / 100)
    noSoundNext = false
}

export function ensureConnected() {
    if (wsState == WS_STATE.DISCONNECTED) {
        connect();
    }
}

function disconnect() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    if (!myWS) {
        wsState = WS_STATE.DISCONNECTED;
        return;
    }

    wsState = WS_STATE.DISCONNECTED;
    myWS.close();
    myWS = null;
}

function scheduleReconnect() {
    if (reconnectTimer) return;
    console.log("&cIRC Connection lost. Reconnecting in 5 seconds...");
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
    }, 5000);
}

/* PAC COMMANDS */
const subcommands = {
    toggle() {
        manuallyDisabled = !manuallyDisabled;
        ircData.fulldisable = false
        ircData.save()
        if (manuallyDisabled) {
            inIRC = false;
            ifInIRC.unregister();
            disconnect();
            chat("&d&lPA IRC &cDisabled");
        } else {
            
            ircData.fulldisable = false;
            ircData.save()
            ensureConnected();
            chat("&d&lPA IRC &aEnabled");
        }
    },

    color(args) {
        if (!args.length) return chat("&cPlease specify a color. Example: &7/pac color red");

        const input = args.join(" ");
        const newColor = getColorCodes(input);
        if (!newColor) return chat("&cUnavailable color");

        color = newColor;
        ircData.color = newColor;
        ircData.save();

        chat(`&aColor set to ${color}${input}`);
    },

    online() {
        if (!myWS?.isOpen())
            return chat("&cYou are not connected to the IRC!");

        myWS.send(JSON.stringify({ type: "request_list" }));
    },

    help() {
        chat(helpMsg);
    },

    fulldisable() {
        manuallyDisabled = true
        ircData.fulldisable = true;
        ircData.save()
        disconnect();
        chat("&d&lPA IRC Fully &cDisabled");
    },

    debug() {
        chat("&d&lPA IRC &7Debug Info:");
        chat(` &binIRC: &r${inIRC}`);
        chat(` &bmanuallyDisabled: &r${manuallyDisabled}`);
        chat(` &bwsState: &r${wsState === WS_STATE.DISCONNECTED ? "DISCONNECTED" : wsState === WS_STATE.CONNECTING ? "CONNECTING" : "CONNECTED"}`);
        chat(` &bmyWS exists: &r${!!myWS}`);
        chat(` &bmyWS open: &r${myWS?.isOpen() ?? false}`);
        chat(` &breconnectTimer: &r${reconnectTimer}`);
        chat(` &busername: &r${color}${username}`);
    }
};

if(ircData.fulldisable) {
    manuallyDisabled = true
}

register("command", (...args) => {
    const [sub, ...rest] = args;

    // No subcommand = toggle PA chat
    if (!sub) {
        inIRC = !inIRC;
        inIRC ? ifInIRC.register() : ifInIRC.unregister();
        if (inIRC) ensureConnected();

        return chat(inIRC ? "&aEntered PA Chat" : "&cExited PA Chat");
    }

    const handler = subcommands[sub.toLowerCase()];
    if (!handler) {
        chat("&cUnknown subcommand");
        subcommands.help()
        return;
    }
    handler(rest);
}).setName("pac").setAliases("pairc");


/* WebSocket Stuff */
function connect() {
    if (manuallyDisabled) return;
    if (wsState !== WS_STATE.DISCONNECTED) return;

    wsState = WS_STATE.CONNECTING;

    const ws = new WebSocketPASF(WS_URL);
    myWS = ws;

    myWS.onMessage = (msg) => {
        if (myWS !== ws) {
            ws.close(); 
            return;
        }
        Client.scheduleTask(0, () => {
            try {
                const data = JSON.parse(msg);

                if (data.type == "user_list") {
                    chat(`&d&lOnline Users &7(&b${data.users.length}&7):`);
                
                    data.users.forEach(user => {
                        chat(` &a● &r${user}`);
                    });
                }

                else if(data.user) ircChat(`${data.user}&r: ${data.text}`);
                else ircChat(`${data.text}`);
            } catch (e) {
                console.log("IRC Parse Error: " + e);
            }
        });
    };

    myWS.onOpen = () => {
        if (myWS != ws) {
            ws.close();
            return;
        }
        wsState = WS_STATE.CONNECTED
        console.log("&aConnected to IRC Web Socket");
    };

    myWS.onClose = () => {
        if (myWS != ws) return;
        myWS = null;
        wsState = WS_STATE.DISCONNECTED;

        if (!manuallyDisabled) {
            scheduleReconnect()
        }
    };

    myWS.onError = (err) => {
        console.log("WebSocket Error: " + err);
    };
    
    myWS.connect();
}

/* Chat Detection Stuff */
const ifInIRC = register("packetSent", (packet, event) => {
    if (!inIRC) {
        ifInIRC.unregister()
        return;
    }

    const message = packet.chatMessage();
    if (!message) return;
    if (!message.startsWith("/") && !message.startsWith("!")) {
        cancel(event)
        noSoundNext = true
        if (myWS && myWS.isOpen()) {
            myWS.send(JSON.stringify({
                user: color + username,
                text: message
            }));
        }
    }
    else if (message.startsWith("/chat ") || /^\/r\s*$/.test(message)) {
        inIRC = false
        chat("&cExited IRC chat mode.")
        ifInIRC.unregister()
    }
}).setFilteredClass(ChatMessageC2SPacket)

/* WebSocket Registers */
register("gameUnload", () => {
    disconnect()
});

register("gameLoad", () => {
    if (!World.isLoaded()) return;
    connect()
});

register("serverConnect", () => {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    setTimeout(() => {
        if (manuallyDisabled) {
            chat("IRC is currently disabled");
            return;
        }
        if (wsState !== WS_STATE.DISCONNECTED) {
            disconnect();
        }
        ensureConnected()
    }, 1000);
});

register("serverDisconnect", () => {
    disconnect()
});
