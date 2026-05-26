class Player {
    constructor (name, x, y) {
        this.x_position = x
        this.y_position = y
        this.name = name
        this.x_source = tileList[this.name][0]
        this.y_source = tileList[this.name][1]

        this.vitality = 10
        this.charisma = 10
        this.perception = 10
        this.agility = 10
        this.strength = 10
        this.wisdom = 10
        this.intelligence = 10

        this.health = this.vitality*10 + this.strength*5
        this.mana = this.intelligence*10
        this.movement_points = Math.round(this.agility * 0.2)

        this.moving = false
        this.move_list = []
        this.move_queue = []

        this.effects = []
    }
    move_check() {
        if (!this.moving) {
            this.moving = true
            game_loop.lock()
            this.move_list = area(this.x_position, this.y_position, this.movement_points)
        }
    }
    move(x, y) {
        const path = reversePath(x, y, this.move_list)
        if (path) {
            path.forEach(tile => {
                map.get(`${tile.x}${tile.y}`).trigger(this)
            })
        }
    }
    move_draw() {
        if (character_map.get(current_character) === this)
            this.move_list.forEach(tile => {
                map.get(`${tile.x}${tile.y}`).highlight()
        })
    }
    mouse_handeler(x, y) {
        if (this.moving) {
            this.move(x, y)
        }
    }
    highlight() {
        ctx.strokeStyle = "lightblue"
        ctx.strokeRect(this.x_position*tile_size, this.y_position*tile_size,
                    tile_size, tile_size
        )
    }
    draw() {
        ctx.drawImage(tile_map, this.x_source * tile_source_size, this.y_source * tile_source_size,
                  tile_source_size, tile_source_size,
                  this.x_position * tile_size, this.y_position * tile_size,
                  tile_size, tile_size
        )
    }
    get x() {return this.x_position}
    get y() {return this.y_position}
    get is_alive() {return this.health > 0}
    get _x_source() {return this.x_source}
    get _y_source() {return this.y_source}

    get _health() {return this.health}
    get _mana() {return this.mana}
    get _movement_points() {return this.movement_points}

    get _strenght() {return this.strength}
    get _agility() {return this.agility}
    get _vitality() {return this.vitality}
    get _charisma() {return this.charisma}
    get _perception() {return this.perception}
    get _wisdom() {return this.wisdom}
    get _intelligence() {return this.intelligence}
}

class Entity {
    constructor(name, x, y, passable=false) {
        this.x_position = x
        this.y_position = y
        this.name = name
        this.passable = passable

        this.effects = []
    }
    get x() {return this.x_position}
    get y() {return this.y_position}
    draw() {
        [this.x_source, this.y_source] = tileList[this.name]
        ctx.drawImage(tile_map, this.x_source * tile_source_size, this.y_source * tile_source_size,
                  tile_source_size, tile_source_size,
                  this.x_position * tile_size, this.y_position * tile_size,
                  tile_size, tile_size
        )
    }
}