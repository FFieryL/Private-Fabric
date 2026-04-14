import { registerPacketChat } from "../../util/Events";
import PogObject from "../../../PogData";
import { chat } from "../../util/utils";
import c from "../../config"
import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager";

const runData = new PogObject("PrivateASF-Fabric", {
    timezone: "America/New_York",
    daily: {},
    scores: {}
}, "data/runData.json")

registerOverlay("RunDisplay", { text: () => "M7: 10", align: "center", colors: true, setting: () => c.runDisplay})

let runEnded = false;
let pendingTeamScore = null

const tzMap = {
    "est": "America/New_York",
    "cst": "America/Chicago",
    "mst": "America/Denver",
    "pst": "America/Los_Angeles",
    "akst": "America/Anchorage",
    "hst": "Pacific/Honolulu"
}

// Time Functions
function getToday() {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: runData.timezone
    })
}

function formatTime(seconds) {
    seconds = Math.floor(seconds)
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
}

function cleanupOldDays() {
    const dates = Object.keys(runData.daily).sort().reverse()
    const keep = dates.slice(0, 7)

    const newDaily = {}
    const newScore = {}
    keep.forEach(d => {
        newDaily[d] = runData.daily[d]
        newScore[d] = runData.scores[d]
    })

    runData.daily = newDaily
    runData.scores = newScore
}

function addRun(seconds) {
    const today = getToday()

    if (!runData.daily[today]) {
        runData.daily[today] = []
    }

    runData.daily[today].push(seconds)

    if (!runData.scores) runData.scores = {}

    if (!runData.scores[today]) runData.scores[today] = []
    runData.scores[today].push(pendingTeamScore)
    cleanupOldDays()
    runData.save()
    pendingTeamScore = null
    runEnded = false
}

registerPacketChat((message) => {   
    if (!c.saveRunData) return;

    if (/Team Score:/.test(message)) {
        const match = message.match(/^\s*Team Score: (\d+) /)
        if (match) pendingTeamScore = parseInt(match[1])
        return
    }

    if (/^\s*Master Mode The Catacombs - Floor VII$/.test(message)) {
        runEnded = true
        pendingTeamScore = null
        return
    }

    const m7End = message.match(/^\s*☠ Defeated Maxor, Storm, Goldor, and Necron in (\d+)m (\d+)s$/)
    if (!m7End) return;

    if (!runEnded) return;
    if (!c.alwaysShowRuns) renderRuns.register()
    const minutes = parseInt(m7End[1])
    const seconds = parseInt(m7End[2])
    const totalSeconds = minutes * 60 + seconds
    addRun(totalSeconds)
})

const renderRuns = register("renderOverlay", (ctx) => {
    if (OverlayEditor.isOpen()) return;
    const today = getToday()
    const runs = runData.daily[today] || []
    
    if (runs.length === 0) {
        drawText(ctx, "&7No runs today", data.RunDisplay, true, "RunDisplay")
        return
    }

    const displayText = `M7: &a${runs.length}`

    drawText(ctx, displayText, data.RunDisplay, true, "RunDisplay")
}).unregister()

register("worldUnload", () => {
    runEnded = false;
    if (!c.alwaysShowRuns) renderRuns.unregister()
})

register("command", (input) => {
    if (!input) {
        const days = Object.keys(runData.daily).sort().reverse()

        if (days.length === 0) {
            chat("&cNo F7/M7 data found.")
            return
        }

        const today = days[0]

        const todayRuns = runData.daily[today] || []

        const todayTotal = todayRuns.length
        const todayAvg = todayRuns.length
            ? todayRuns.reduce((a, b) => a + b, 0) / todayRuns.length
            : 0
        const todayBest = todayRuns.length ? Math.min(...todayRuns) : null

        const weekDays = days.slice(0, 7)

        let weekRuns = 0
        let weekTimeSum = 0
        let weekRunList = []
        let weekBest = null
        weekDays.forEach(d => {
            const runs = runData.daily[d] || []

            weekRuns += runs.length
            weekTimeSum += runs.reduce((a, b) => a + b, 0)

            weekRunList.push({ day: d, runs })

            if (runs.length > 0) {
                const dayBest = Math.min(...runs)

                if (weekBest === null || dayBest < weekBest) {
                    weekBest = dayBest
                }
            }
        })

        const weekAvg = weekRuns ? weekTimeSum / weekRuns : 0

        ChatLib.chat("&5&m--------------------------------")
        ChatLib.chat("&d&lF7/M7 STATS")

        ChatLib.chat("&5Today:")
        ChatLib.chat(`&fRuns: &a${todayTotal}`)
        ChatLib.chat(`&fBest: &a${todayBest !== null ? formatTime(todayBest) : "N/A"}`)
        ChatLib.chat(`&fAvg: &a${formatTime(todayAvg)}`)

        ChatLib.chat("&5Week:")
        ChatLib.chat(`&fRuns: &a${weekRuns}`)
        ChatLib.chat(`&fBest: &a${weekBest !== null ? formatTime(weekBest) : "N/A"}`)
        ChatLib.chat(`&fAvg: &a${formatTime(weekAvg)}`)

        ChatLib.chat("&5&m--------------------------------")
        ChatLib.chat("&fuse /m7runstats to see full run breakdown")
        return;
    }
    if (input == "clear") {
        runData.daily = {}
        runData.scores = {}
        runData.save()
        chat("&aRun data cleared!")
        return;
    }
    const key = input.toLowerCase()
    const tz = tzMap[key]

    if (!tz) {
        chat("&cInvalid timezone key!")
        chat("&eUse: est, cst, mst, pst, akst, hst")
        return
    }

    new Date().toLocaleString("en-US", { timeZone: tz })

    runData.timezone = tz
    runData.save()

    chat(`&aTimezone set to ${tz}`)
}).setName("m7runs")

const runGui = new Gui()
let scroll = 0

register("command", () => {
    runGui.open()
}).setName("m7runstats")

runGui.registerScrolled((mouseX, mouseY, dir) => {
    const runs = getRuns()
    const lineHeight = 12
    const listHeight = runs.length * lineHeight
    
    const maxScroll = Math.max(0, listHeight - (Renderer.screen.getHeight() / 2 - 40))

    scroll += dir * 10 

    if (scroll < 0) scroll = 0
    if (scroll > maxScroll) scroll = maxScroll
})

function getRuns() {
    const days = Object.keys(runData.daily).sort().reverse()
    let list = []

    days.forEach(d => {
        const runs = runData.daily[d] || []
        runs.forEach(t => {
            list.push({ day: d, time: t })
        })
    })

    return list
}
runGui.registerOpened(() => {
    renderStuff.register()
})

runGui.registerClosed(() => {
    renderStuff.unregister()
})

const renderStuff = register("renderOverlay", (ctx) => {
    if (!runGui.isOpen()) return

    const width = Renderer.screen.getWidth()
    const height = Renderer.screen.getHeight()

    ctx.fill(0, 0, width, height, 0xAA000000 | 0)

    const today = getToday()
    const runs = runData.daily?.[today] || []
    const scores = runData.scores?.[today] || []

    const centerX = width / 2
    const centerY = height / 2

    const lineHeight = 12
    const listHeight = runs.length * lineHeight

    let y = (centerY - listHeight - 20) + scroll 

    if (runs.length == 0) {
        new Text("No F7/M7 Runs", centerX, centerY - 20)
                .setScale(1)
                .setAlign("center")
                .setShadow(true)
                .draw(ctx)
        return;
    }

    for (let i = 0; i < runs.length; i++) {
        const time = runs[i]
        const score = scores[i]

        if (y > 10 && y < centerY - 10) {
            let text = `&8#${i + 1} &f→ &a${formatTime(time)}`
            if (score !== undefined && score !== null) {
                text += ` &8| &e${score}`
            }

            new Text(text, centerX, y)
                .setScale(1)
                .setAlign("center")
                .setShadow(true)
                .draw(ctx)
        }
        y += lineHeight
    }
})

if (c.saveRunData && c.alwaysShowRuns) renderRuns.register()

c.registerListener("Always Display Runs", (curr) => {
    if (curr && c.saveRunData) renderRuns.register()
    else renderRuns.unregister()
})