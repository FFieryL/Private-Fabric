import PogObject from "../../../PogData"
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
    { pattern: "Your Implosion hit .+ for .+ damage.", description: "Hide Implosion Message" },
    { pattern: "Your Kill Combo has expired! You reached a .+ Kill Combo!", description: "Hide Expired Kill Combo Message" },
    { pattern: "There are blocks in the way!", description: "Hide Blocks in your way" },
    { pattern: "\\+.+ Kill Combo.+", description: "Hide Kill Combo" },
    { pattern: "Your Guided Sheep hit .+ for .+ damage.", description: "Hide Guided Sheep Message" },
    { pattern: "A Crypt Wither Skull exploded, hitting you for .+ damage.", description: "Hide Crypt Skull Message" },
    { pattern: "\\[NPC\\] Mort: .+", description: "Hide Mort Messages" },
    { pattern: "Your radio is weak. Find another enjoyer to boost it.", description: "Hide Weak Radio" },
    { pattern: "Your radio lost signal. There's too many enjoyers on this channel.", description: "Hide Lost Signal Radio" },
    { pattern: "(?:\\[.+\\])?.+ has obtained .+!", description: "Hide Obtained Messages in Dungeons" },
    { pattern: "This ability is on cooldown for .+s.", description: "Hide Ability CD" },
    { pattern: "(?:DUNGEON BUFF! You found a .+! \\(.+\\))|(?:\\s*(?:Also )?[Gg]ranted you .+)", description: "Hide Dungeon Buffs" },
    { pattern: ".+ is now available!", description: "Hide Ability Ready Messages"},
    { pattern: ".+ is ready to use! Press DROP to activate it!", description: "Hide Ult Messages"},
    //{ pattern: "", description: ""},
]

function loadRegexes() {
    hiddenRegexes = []
    data.chatHiderPatterns.forEach(item => {
        try {
            // Support both old string format and new object format
            const pattern = typeof item === 'string' ? item : item.pattern;

            if (pattern instanceof RegExp) {
                hiddenRegexes.push(pattern)
            } else {
                const regexPattern = "^" + pattern.replace(/\*/g, ".+") + "$"
                hiddenRegexes.push(new RegExp(regexPattern, "i"))
            }
        } catch (e) {
            chat(`&cInvalid saved regex removed: &e${item}`)
        }
    })
}

loadRegexes()

register("chat", (message, event) => {
    if (!hiddenRegexes.length) return

    const clean = message.removeFormatting()

    // Don't hide your own module messages
    if (clean.startsWith("Added hide pattern:")
        || clean.startsWith("Removed pattern:")
        || clean.startsWith("Cleared all hidden chat patterns.")
        || clean.startsWith("Hidden Chat Patterns")
        || clean.startsWith("Default Chat Patterns")
        || /^\d+\.\s/.test(clean)) {
        return
    }

    for (let regex of hiddenRegexes) {
        if (regex.test(clean)) {
            cancel(event)
            return
        }
    }
}).setCriteria("${message}")


register("command", (action, ...args) => {

    if (!action) {
        chat("&cUsage:")
        chat("&e/pahc add <regex>")
        chat("&e/pahc list")
        chat("&e/pahc remove <index>")
        chat("&e/pahc clear")
        chat("* or .+ for stuff that changes")
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
        chat(`&aRemoved pattern: &e${removed[0].description}`)
        if (args.includes("deleteAndRefresh")) {
            if (lastListMessages.length) {
                lastListMessages.forEach(msgObj => {
                    ChatLib.deleteChat(msgObj)
                })
                lastListMessages = []
            }

            showHiddenChatList()
        }


    }

    else if (action === "clear") {
        data.chatHiderPatterns = []
        loadRegexes()
        data.save()
        chat("&aCleared all hidden chat patterns.")
        return
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
    else if (action === "add") {
        if (!args.length) return
        const patternString = args.join(" ")

        if (data.chatHiderPatterns.some(p => (typeof p === 'string' ? p : p.pattern) === patternString)) {
            chat(`&cThis pattern is already hidden: &e${patternString}`)
            return
        }

        try {
            new RegExp(patternString)
        } catch (e) {
            chat("&cInvalid regex!")
            return
        }

        data.chatHiderPatterns.push({ pattern: patternString, description: "User Added" })
        loadRegexes()
        data.save()
        chat(`&aAdded hide pattern: &e${patternString}`)
    }
    else if (action === "addDefault") {
        if (!args.length) return;
        const patternStr = args.join(" ");

        const defaultObj = defaultPatterns.find(p => p.pattern === patternStr);

        if (data.chatHiderPatterns.some(p => (typeof p === 'string' ? p : p.pattern) === patternStr)) {
            chat(`&cThis pattern is already hidden: &e${patternStr}`);
            return;
        }

        data.chatHiderPatterns.push(defaultObj || { pattern: patternStr, description: "Default" });
        loadRegexes();
        data.save();

        chat(`&aAdded hide pattern: &e${patternStr}`);

        if (lastListMessages.length) {
            lastListMessages.forEach(msg => ChatLib.deleteChat(msg));
            lastListMessages = [];
        }
        showDefaultPatterns();
    }
    else {
        chat("&cUsage:")
        chat("&e/pahc add <regex>")
        chat("&e/pahc list")
        chat("&e/pahc remove <index>")
        chat("&e/pahc clear")
        chat("* or .+ for stuff that changes")
        chat("add a \\ if you are adding special characters")
        return
    }

}).setName("pahc")


function showDefaultPatterns(page = 1) {
    if (lastListMessages.length) {
        lastListMessages.forEach(msg => ChatLib.deleteChat(msg));
        lastListMessages = [];
    }

    const remainingPatterns = defaultPatterns.filter(def => 
        !data.chatHiderPatterns.some(saved => 
            (typeof saved === 'string' ? saved : saved.pattern) === def.pattern
        )
    );
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
        const item = remainingPatterns[i]
        if (!item) continue;

        const pattern = item.pattern
        const desc = item.description ? `${item.description}` : ""

        const text = new TextComponent(
            "",
            {
                text: `&e${i + 1}.&7 ${desc}`,
                clickEvent: {
                    action: "run_command",
                    value: `/pahc addDefault ${pattern}`
                },
                hoverEvent: {
                    action: "show_text",
                    value: `&eClick to add this default pattern (${pattern})`
                }
            },
            ""
        );

        ChatLib.chat(text)
        lastListMessages.push(text)
    }

    // Pagination buttons
    if (totalPages > 1) {
        if (page > 1 && page < totalPages) {
            const both = new TextComponent(
                "",
                {
                    text: "&a[Prev Page] ",
                    clickEvent: { action: "run_command", value: `/pahc default ${page - 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to previous page" }
                },
                {
                    text: "&a[Next Page] ",
                    clickEvent: { action: "run_command", value: `/pahc default ${page + 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to next page" }
                },
                ""
            );
            ChatLib.chat(both);
            lastListMessages.push(both);
        }
        else if (page == totalPages) {
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

        else {
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
        const item = data.chatHiderPatterns[i];
        if (!item) continue;

        const pattern = typeof item === 'string' ? item : item.pattern;

        const displayText = (typeof item === 'object' && item.description)
            ? `&7${item.description}`
            : `&f${pattern}`;

        const text = new TextComponent(
            "",
            {
                text: `&e${i + 1}. ${displayText}`,
                clickEvent: {
                    action: "run_command",
                    value: `/pahc remove ${i + 1} deleteAndRefresh`
                },
                hoverEvent: {
                    action: "show_text",
                    value: `&eClick to remove:\n&f${pattern}`
                }
            },
            ""
        );

        ChatLib.chat(text);
        lastListMessages.push(text);
    }

    if (totalPages > 1) {
        if (page > 1 && page < totalPages) {
            const both = new TextComponent(
                "",
                {
                    text: "&a[Prev Page] ",
                    clickEvent: { action: "run_command", value: `/pahc list ${page - 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to previous page" }
                },
                {
                    text: "&a[Next Page] ",
                    clickEvent: { action: "run_command", value: `/pahc list ${page + 1}` },
                    hoverEvent: { action: "show_text", value: "&eClick to go to next page" }
                },
                ""
            );
            ChatLib.chat(both);
            lastListMessages.push(both);
        }
        else if (page == totalPages) {
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

        else {
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
