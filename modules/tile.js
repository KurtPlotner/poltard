class Tile {
    constructor(name, x, y, passable = true, cost = 1) {
        this.x_position = x
        this.y_position = y
        this.name = name
        this._passable = passable
        this.cost = cost

        this.effects = []
    }
    get x() {return this.x_position}
    get y() {return this.y_position}
    get passable() {return this._passable}
    set passable(v) {this._passable = v}
    highlight(color="rgba(0, 191, 255, 0.5)") {
        ctx.fillStyle = color; 
        ctx.fillRect(this.x_position*tile_size, this.y_position*tile_size,
                       tile_size, tile_size)
    }
    draw() {
        [this.x_source, this.y_source] = tileList[this.name]
        ctx.drawImage(tile_map, this.x_source * tile_source_size, this.y_source * tile_source_size,
                  tile_source_size, tile_source_size,
                  this.x_position * tile_size, this.y_position * tile_size,
                  tile_size, tile_size
        )
    }
    trigger(entity) {
        this.effects.forEach(effect => {
            effect(entity, this)
        })
    }
}



class TileEffects {
    constructor() {
        this.name = "effect"
    }
    execute(entity, tile) {
        return
    }
}

class TileTestEffect extends TileEffects {
    execute(entity, tile) {
        console.log("trigger", tile.x, " ", tile.y)
    }
}