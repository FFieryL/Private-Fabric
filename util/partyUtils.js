import { registerPacketChat } from "./Events"

export default new class Party {
    constructor() {
        this.members = {} // "Username": {name: "UnclaimedBloom6", rank: "", formattedRank: "&7", formattedName: "&7UnclaimedBloom6"}
        this.size = 0
        this.leader = null // Unformatted username
        this.inParty = false

        this.cachedranks = {} // {"UnclaimedBloom6": "&c[ADMIN]"}

        this.partyCreatedListeners = []
        this.partyDisbandRegisters = []

        this.memberJoinedFuncs = []
        this.memberLeftFuncs = []

        registerPacketChat((message) => {
            let match;
            match = message.match(/^((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&ejoined the party.&r$/);
            if (match) {
                const [, rank, name] = match;
                this._addMember(name, rank);
                return;
            }

            // Party leave
            match = message.match(/^((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&ehas left the party.&r$/);
            if (match) {
                const [, , name] = match;
                this._removeMember(name);
                return;
            }

            // Removed from party
            match = message.match(/^((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&ehas been removed from the party.&r$/);
            if (match) {
                const [, , name] = match;
                this._removeMember(name);
                return;
            }

            // Invited to party
            match = message.match(/^((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&einvited .+ &r&eto the party! They have &r&c60 &r&eseconds to accept.&r$/);
            if (match) {
                const [, rank, name] = match;
                this._addMember(name, rank);
                return;
            }

            // Party chat line (special)
            match = message.match(/^&r&9Party &8> ((?:&.(?:\[[^\]]+\])?)) *(\w+)&f: &r.+&r$/);
            if (match) {
                const [, rank, name] = match;
                this._addMember(name, rank, true);
                return;
            }

            // You joined a party
            match = message.match(/^&eYou have joined &r((?:&.(?:\[[^\]]+\])?)) *(\w+)'s &r&eparty!&r$/);
            if (match) {
                const [, rank, name] = match;
                this._addMember(name, rank);
                this.leader = name;
                this._addMember(Player.getName());
                return;
            }

            // Party members/moderators list
            match = message.match(/^&eParty (?:Members|Moderators): &r(.+)$/);
            if (match) {
                const rest = match[1];
                const segments = rest.split(" ● &r");
                for (let segment of segments) {
                    const m = segment.match(/^((?:&.(?:\[[^\]]+\])?)) *(\w+)&r&(.)$/);
                    if (!m) continue;
                    const [, rank, name, dotColor] = m;
                    this._addMember(name, rank, dotColor == "a");
                }
                return;
            }

            // Party leader
            match = message.match(/^&eParty Leader: (?:&r)?((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&(\w)●&r$/);
            if (match) {
                const [, rank, name, dotColor] = match;
                this._addMember(name, rank);
                this.leader = name;
                if (dotColor == "a") this.members[name].online = true;
                else if (dotColor == "c") this.members[name].online = false;
                return;
            }

            // Player disconnected
            match = message.match(/^((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&ehas disconnected, they have &r&c5 &r&eminutes to rejoin before they are removed from the party\.&r$/);
            if (match) {
                const [, rank, name] = match;
                this._addMember(name, rank, false);
                return;
            }

            // Leader disconnected
            match = message.match(/^&eThe party leader, &r((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&ehas disconnected, they have &r&c5 &r&eminutes to rejoin before the party is disbanded\.&r$/);
            if (match) {
                const [, rank, name] = match;
                this._addMember(name, rank, false);
                this.leader = name;
                return;
            }

            // Leader rejoined
            match = message.match(/^&eThe party leader (?:&r)?((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&ehas rejoined\.&r$/);
            if (match) {
                const [, rank, name] = match;
                this._addMember(name, rank, true);
                this.leader = name;
                return;
            }

            // Party transfer
            match = message.match(/^&eThe party was transferred to &r((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&eby &r((?:&.(?:\[[^\]]+\])?)) *(\w+)&r$/);
            if (match) {
                const [, rank, name, rank2, name2] = match;
                this._addMember(name, rank);
                this.leader = name;
                this._addMember(name2, rank2);
                return;
            }

            // Party transfer due to leave
            match = message.match(/^&eThe party was transferred to &r((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&ebecause &r((?:&.(?:\[[^\]]+\])?)) *(\w+) &r&eleft&r$/);
            if (match) {
                const [, rank1, name1, leaderRank, leaderName] = match;
                if (leaderName == Player.getName()) {
                    this._disband();
                    return;
                }
                this._addMember(name1, rank1);
                this.leader = name1;
                this._removeMember(leaderName);
                return;
            }

            // Party Finder join
            match = message.match(/^&dParty Finder &r&f> &r(&.)(\w{1,16}) &r&ejoined the dungeon group! \(&r&b(\w+) Level (\d+)&r&e\)&r$/);
            if (match) {
                const [, color, name] = match;
                this._addMember(name);
                return;
            }

            // General chat to extract name/rank
            match = message.match(/^(?:(?:&.)+\[(?:&.)+(\d+)(?:&.)+\] )?(?:(?:&.)+([^\w]) )?(&r(?:&.\[[^\]]+\]|&7))\s?(\w{1,16})(?:&.)+: (.+)$/);
            if (match) {
                const [, sbLevel, emblem, rank, name, msg] = match;
                this.cachedranks[name] = rank;
                return;
            }

            // Party Finder queued
            if (message === "Party Finder > Your party has been queued in the dungeon finder!") {
                this._addMember(Player.getName());
                if (this.leader == null) this.leader = Player.getName();
                return;
            }

            // Party Members header (disband)
            match = message.match(/^&6Party Members \(\d+\)&r$/);
            if (match) {
                this._disband(false);
                return;
            }

        })


        const disbands = [
            /^.+ &r&ehas disbanded the party!&r$/,
            /^&eYou have been kicked from the party by .+ &r&e&r$/,
            /^&cThe party was disbanded because all invites expired and the party was empty\.&r$/,
            /^&cThe party was disbanded because the party leader disconnected\.&r$/,
            /^&eYou left the party\.&r$/,
        ]

        for (let regex of disbands) {
            register("chat", () => {
                this._disband()
            }).setCriteria(regex)
        }
    }

    _addMember(player, rank = "", online = true) {
        if (!this.inParty) {
            for (let i = 0; i < this.partyCreatedListeners.length; i++) {
                this.partyCreatedListeners[i]()
            }
        }
        this.inParty = true

        if (rank == "" && player in this.cachedranks) {
            rank = this.cachedranks[player]
        }

        // Cache ranks
        if (rank !== "" && !(player in this.cachedranks)) {
            this.cachedranks[player] = rank
        }

        const isNew = player in this.members

        this.members[player] = {
            name: player,
            rank: rank.removeFormatting(),
            formattedRank: rank,
            formattedName: this.getFormattedName(player),
            online: online,
        }

        if (isNew) {
            for (let i = 0; i < this.memberJoinedFuncs.length; i++) {
                this.memberJoinedFuncs[i](player)
            }
        }

        this.size = Object.keys(this.members).length
    }

    _removeMember(player) {
        for (let i = 0; i < this.memberLeftFuncs.length; i++) {
            this.memberLeftFuncs[i](player)
        }

        delete this.members[player]

        this.size = Object.keys(this.members).length

        if (this.size == 0) {
            this._disband()
        }
    }

    _disband(doTriggers = true) {
        this.members = {}
        this.size = 0
        this.leader = null
        this.inParty = false

        if (!doTriggers) {
            return
        }

        for (let i = 0; i < this.partyDisbandRegisters.length; i++) {
            this.partyDisbandRegisters[i]()
        }
    }

    /**
     * Runs a function when you join a party
     * @param {Function} func 
     */
    onPartyJoined(func) {
        this.partyCreatedListeners.push(func)
    }

    /**
     * Runs a function when you are no longer in a party
     * @param {Function} func 
     */
    onPartyDisband(func) {
        this.partyDisbandRegisters.push(func)
    }

    /**
     * @callback MemberChangeFunc
     * @param {String} player
    */

    /**
     * Runs a function when a player joins the party
     * @param {MemberChangeFunc} func 
     */
    onPlayerJoined(func) {
        this.memberJoinedFuncs.push(func)
    }

    /**
     * Runs the function when a player leaves or is kicked from the party
     * @param {MemberChangeFunc} func 
     */
    onPlayerLeft(func) {
        this.memberLeftFuncs.push(func)
    }

    getFormattedName(player) {
        if (!(player in this.cachedranks)) {
            return player
        }

        const rank = this.cachedranks[player]

        let formattedName = `${rank}`
        if (!/^(?:&.)*$/.test(rank)) {
            formattedName += " "
        }

        return formattedName + player
    }

    /**
     * Returns a list of the unformatted usernames of everyone in the party
     * @returns {String[]}
     */
    getMemberNames() {
        return Object.keys(this.members)
    }
}