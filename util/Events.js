const PlayerListS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.PlayerListS2CPacket")
const TeamS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.TeamS2CPacket")

const triggerEvent = (functionArray, ...args) => functionArray.forEach(func => func(...args))


/**
 * @callback ScoreboardLineFunction
 * @param {Int} line - The line
 * @param {String} text - The new text for that line
 */

const scoreboardLineFuncs = []
/**
 * Runs a function when a new Scoreboard line is received.
 * @param {ScoreboardLineFunction} method 
 */
export const onScoreboardLine = (method) => scoreboardLineFuncs.push(method)


register("packetReceived", (packet) => {
    if (!(packet instanceof TeamS2CPacket)) return;
    // team name like "team_0"
    const teamName = packet.getTeamName()
    const match = teamName.match(/^team_(\d+)$/)
    if (!match) return

    const line = parseInt(match[1])

    // Team info (prefix/suffix)
    const optionalTeam = packet.getTeam()
    if (!optionalTeam.isPresent()) return

    const team = optionalTeam.get()

    // Text objects → strings
    const prefix = team.getPrefix().getString()
    const suffix = team.getSuffix().getString()

    const message = prefix + suffix

    triggerEvent(scoreboardLineFuncs, line, message)

}).setFilteredClass(TeamS2CPacket)

/**
 * @callback TablistAddFunc
 * @param {String} text - The text which was added or changed
 */

const tablistAddFuncs = []
const tablistUpdateFuncs = []

/**
 * 
 * @param {TablistAddFunc} func 
 * @returns 
 */
export const onTabLineAdded = (func) => tablistAddFuncs.push(func)

/**
 * 
 * @param {TablistAddFunc} func 
 * @returns 
 */


export const onTabLineUpdated = (func) => tablistUpdateFuncs.push(func)

register("packetReceived", (packet) => {
    if (!(packet instanceof PlayerListS2CPacket)) return;
    const players = packet.getEntries()
    const actions = packet.getActions()

    const isUpdate = actions == "[UPDATE_DISPLAY_NAME]"
    const isAdd = actions == "[ADD_PLAYER]"

    if (!isUpdate && !isAdd) return

    players.forEach(entry => {
        const name = entry.displayName() // or entry.getDisplayName()
        if (!name) return

        const text = name.getString()

        if (isUpdate) triggerEvent(tablistUpdateFuncs, text)
        if (isAdd) triggerEvent(tablistAddFuncs, text)
    })
}).setFilteredClass(PlayerListS2CPacket)