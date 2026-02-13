export default class StarMob {
    constructor(entity) {
        this.entity = entity
        this.name = entity.getName()
        this.updateHeight()
        this.update()
    }

    updateHeight() {
        const [_, mobName, sa] = this.name.match(/✯ (.+).+❤$|^(Shadow Assassin)$/)

        this.height = 2

        if (!sa) {
            if (mobName.includes("Fels")) {
                this.height = 3
            }
            else if (mobName.includes("Withermancer")) {
                this.height = 3
            } 
        } 
        else {
            this.height = 1.8
        }
        
    }

    update() {
        let mobName = this.entity.getName();
        this.mobType = 0;
        if(mobName.includes("Fels")) this.mobType = "fel"
        if(mobName.includes("Shadow Assassin")) this.mobType = "sa";
        this.name = mobName;
        this.x = this.entity.getX()
        this.y = this.entity.getY()
        this.z = this.entity.getZ()
        
    }
}