import PogObject from "../../../PogData"
import { registerPacketChat } from "../../util/Events"
import { chat } from "../../util/utils"

export const data = new PogObject(
    "PrivateASF-Fabric",
    {
        chatHiderPatterns: []
    },
    "data/chatHider.json"
)

let lastListMessages = []
let hiddenRegexes = []
const defaultPatterns = [
    "Your Implosion hit (.+) for (.+) damage",
    "Your Kill Combo has expired! You reached a (.+) Kill Combo!",
    "There are blocks in the way!",
    "\\+(.+) Kill Combo (.+)",
    "(.+) has obtained Superboom TNT!",
    "Your Guided Sheep hit \* for \* damage.",
    "A Crypt Wither Skull exploded, hitting you for \* damage.",
    "\\[NPC\\] Mort: (.+)"
]

function loadRegexes() {
    hiddenRegexes = []

    data.chatHiderPatterns.forEach(pattern => {
        try {
            const regexPattern = pattern.replace(/\*/g, "(.+)")
            hiddenRegexes.push(new RegExp(regexPattern, "i"))
        } catch (e) {
            chat(`&cInvalid saved regex removed: &e${pattern}`)
        }
    })
}

loadRegexes()

registerPacketChat((message, formatted, event) => {

    if (!hiddenRegexes.length) return

    for (let regex of hiddenRegexes) {
        if (regex.test(message)) {
            cancel(event)
            return
        }
    }

})

register("command", (action, ...args) => {

    if (!action) {
        chat("&cUsage:")
        chat("&e/pahc add <regex>")
        chat("&e/pahc list")
        chat("&e/pahc remove <index>")
        chat("&e/pahc clear")
        chat("* or (.+) for stuff that changes")
        chat("add a \\ if you are adding special characters")
        return
    }

    else if (action === "list") {
        let page = 1;
        if (args) {
            const parsed = parseInt(args[0]);
            if (!isNaN(parsed) && parsed > 0) page = parsed;
        }
        showHiddenChatList(page);
        return;
    }

    else if (action === "remove") {
        const index = parseInt(args[0])

        if (isNaN(index) || index < 1 || index > data.chatHiderPatterns.length) {
            chat("&cInvalid index.")
            return
        }

        const removed = data.chatHiderPatterns.splice(index - 1, 1)
        loadRegexes()
        data.save()

        if (args.includes("deleteAndRefresh")) {
            if (lastListMessages.length) {
                lastListMessages.forEach(msgObj => {
                    ChatLib.deleteChat(msgObj)
                })
                lastListMessages = []
            }

            showHiddenChatList()
        }


        chat(`&aRemoved pattern: &e${removed[0]}`)
    }

    else if (action === "clear") {
        data.chatHiderPatterns = []
        loadRegexes()
        data.save()
        chat("&aCleared all hidden chat patterns.")
        return
    }
    else if (action === "add") {
        const patternString = [...args].join(" ")


        if (data.chatHiderPatterns.includes(patternString)) {
            chat(`&cThis pattern is already hidden: &e${patternString}`)
            return
        }

        try {
            new RegExp(patternString)
        } catch (e) {
            chat("&cInvalid regex!")
            return
        }

        data.chatHiderPatterns.push(patternString)
        loadRegexes()
        data.save()

        chat(`&aAdded hide pattern: &e${patternString}`)
    }
    else if (action === "default") {
        let page = 1;
        if (args) {
            const parsed = parseInt(args[0]);
            if (!isNaN(parsed) && parsed > 0) page = parsed;
        }
        showDefaultPatterns(page);
        return;
    }

    else {
        chat("&cUsage:")
        chat("&e/pahc add <regex>")
        chat("&e/pahc list")
        chat("&e/pahc remove <index>")
        chat("&e/pahc clear")
        chat("* or (.+) for stuff that changes")
        chat("add a \\ if you are adding special characters")
        return
    }

}).setName("pahc")


function showDefaultPatterns(page = 1) {
    if (lastListMessages.length) {
        lastListMessages.forEach(msg => ChatLib.deleteChat(msg));
        lastListMessages = [];
    }

    // Filter out patterns that the user already saved
    const remainingPatterns = defaultPatterns.filter(p => !data.chatHiderPatterns.includes(p));
    const totalPatterns = remainingPatterns.length;

    if (totalPatterns === 0) {
        const msg = "&cNo default patterns available (all added).";
        ChatLib.chat(msg);
        lastListMessages.push(msg);
        return;
    }

    const totalPages = Math.ceil(totalPatterns / PAGE_SIZE);

    // Ensure page is valid
    page = parseInt(page);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, totalPatterns);

    const header = new TextComponent(
        "",
        { text: `&aDefault Chat Patterns (Page ${page}/${totalPages}):` },
        ""
    );
    ChatLib.chat(header);
    lastListMessages.push(header);

    for (let i = start; i < end; i++) {
        const pattern = remainingPatterns[i];
        if (!pattern) continue;

        const text = new TextComponent(
            "",
            {
                text: `&e${i + 1}. &f${pattern}`,
                clickEvent: {
                    action: "run_command",
                    value: `/pahc add ${pattern}`
                },
                hoverEvent: {
                    action: "show_text",
                    value: "&eClick to add this default pattern"
                }
            },
            ""
        );

        ChatLib.chat(text);
        lastListMessages.push(text);
    }

    // Pagination buttons
    if (totalPages > 1) {
        if (page > 1) {
            const prev = new TextComponent(
                "",
                {
                    text: "&a[Prev Page] ",
                    clickEvent: { action: "run_command", value: `/pahc default ${page - 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to previous page" }
                },
                ""
            );
            ChatLib.chat(prev);
            lastListMessages.push(prev);
        }

        if (page < totalPages) {
            const next = new TextComponent(
                "",
                {
                    text: "&a[Next Page]",
                    clickEvent: { action: "run_command", value: `/pahc default ${page + 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to next page" }
                },
                ""
            );
            ChatLib.chat(next);
            lastListMessages.push(next);
        }
    }
}



const PAGE_SIZE = 5;

function showHiddenChatList(page = 1) {
    if (lastListMessages.length) {
        lastListMessages.forEach(msg => ChatLib.deleteChat(msg));
        lastListMessages = [];
    }

    const totalPatterns = data.chatHiderPatterns.length;
    if (totalPatterns === 0) {
        const msg = "&cNo hidden chat patterns saved.";
        ChatLib.chat(msg);
        lastListMessages.push(msg);
        return;
    }

    const totalPages = Math.ceil(totalPatterns / PAGE_SIZE);

    // Ensure page is a valid number
    page = parseInt(page);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, totalPatterns);

    const header = new TextComponent(
        "",
        { text: `&aHidden Chat Patterns (Page ${page}/${totalPages}):` },
        ""
    );
    ChatLib.chat(header);
    lastListMessages.push(header);

    for (let i = start; i < end; i++) {
        const pattern = data.chatHiderPatterns[i];
        if (!pattern) continue; // Safety check

        const text = new TextComponent(
            "",
            {
                text: `&e${i + 1}. &f${pattern}`,
                clickEvent: {
                    action: "run_command",
                    value: `/pahc remove ${i + 1} deleteAndRefresh`
                },
                hoverEvent: {
                    action: "show_text",
                    value: "&eClick to remove this hidden chat pattern"
                }
            },
            ""
        );

        ChatLib.chat(text);
        lastListMessages.push(text);
    }

    // Pagination buttons
    if (totalPages > 1) {
        if (page > 1) {
            const prev = new TextComponent(
                "",
                {
                    text: "&a[Prev Page] ",
                    clickEvent: { action: "run_command", value: `/pahc list ${page - 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to previous page" }
                },
                ""
            );
            ChatLib.chat(prev);
            lastListMessages.push(prev);
        }

        if (page < totalPages) {
            const next = new TextComponent(
                "",
                {
                    text: "&a[Next Page]",
                    clickEvent: { action: "run_command", value: `/pahc list ${page + 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to next page" }
                },
                ""
            );
            ChatLib.chat(next);
            lastListMessages.push(next);
        }
    }
}
