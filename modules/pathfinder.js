class Path {
    constructor(start, end) {
        this.open_list = []
        this.closed_list = []
        this.path = []
        this.end = end
        this.open_list.push({
            x: start.x,
            y: start.y,
            h: 0,
            g: 0,
            f: 0,
            parent: undefined
        })
        this.find_path()
    }
    find_path() {
        while (this.open_list.length > 0) {
            let current_node = this.open_list[0]
            for (let i = 1; i < this.open_list.length; i++) {
                if (this.open_list[i].f < current_node.f || (this.open_list[i].f === current_node.f && this.open_list[i].h < current_node.h)) {
                    current_node = this.open_list[i]
                }
            }
            this.open_list.splice(this.open_list.indexOf(current_node), 1)
            this.closed_list.push(current_node)

            if (current_node.x === this.end.x && current_node.y === this.end.y) {
                let temp = current_node
                while (temp) {
                    this.path.push(temp)
                    temp = temp.parent
                }
                this.path.reverse()
                console.log("Path has been found ", this.path)
                break;
            }

            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]

            for (let dir of directions) {
                let x_position = current_node.x + dir[0]
                let y_position = current_node.y + dir[1]
                console.log(x_position, current_node.x)

                if (isValid(x_position, y_position)) {
                    const neighbor = {
                        x: x_position,
                        y: y_position,
                        g: current_node.g + map.get(`${x_position}${y_position}`).cost,
                        h: dist(x_position, y_position, this.end.x, this.end.y)["total_distance"],
                        f: 0,
                        parent: current_node
                    }
                    neighbor.f = neighbor.g + neighbor.h

                    if (this.closed_list.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                    continue;
                    }
                    
                    const open_list_tile = this.open_list.find((node) => node.x === neighbor.x && node.y === neighbor.y)
                    if (!open_list_tile || neighbor.g < open_list_tile.g) {
                        this.open_list.push(neighbor)
                        console.log(this.open_list)
                    }
                }
            }
        }
    }
}

function area(x, y, distance=1) {
    let openSet = []
    let closedSet = []
    openSet.push({
        x:x,
        y:y,
        g:0,
        parent:undefined
    })

    while (openSet.length > 0) {
        currentNode = openSet[0]
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].g > currentNode.g) {
                currentNode = openSet[i]
            }
        }

        openSet.splice(openSet.indexOf(currentNode), 1);
        closedSet.push(currentNode);


        directions = [[0,1], [1,0], [0,-1], [-1,0]]

        for (let dir of directions) {
            xPos = currentNode.x + dir[0]
            yPos = currentNode.y + dir[1]

            if (isValid(xPos, yPos)) {
                neighbor = {
                    x:xPos,
                    y:yPos,
                    g:currentNode.g + map.get(`${xPos}${yPos}`).cost,
                    parent:currentNode
                }
            
            if (closedSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                continue
            }

            const openSetNode = openSet.find((node) => node.x === neighbor.x && node.y === neighbor.y)
            if ((!openSetNode || openSetNode.g > neighbor.g) && neighbor.g <= distance) {
                openSet.push(neighbor)
            }
            }
        }
    }
    return closedSet;
}

function dist(x_start, y_start, x_end, y_end) {
    let x_distance = x_start - x_end
    let y_distance = y_start - y_end
    let total_distance = Math.abs(x_distance) + Math.abs(y_distance)
    return {x_distance:x_distance, y_distance:y_distance, total_distance:total_distance}
}

function isValid(x, y) {
    let tile = map.get(`${x}${y}`)
    if (tile && tile.passable) return true
    else return false
}

function reversePath(x, y, path) {
    let filteredPath = path.filter((tile) => tile.x === x && tile.y === y)
    if (filteredPath.length > 0) {
        currentTile = filteredPath[0]
        if (filteredPath.length > 1) {
            filteredPath.forEach((tile) => {
                if (tile.g < currentTile.g) {
                    currentTile = tile
                }
            })
        }
        let result = []
        while (currentTile) {
            result.push(currentTile)
            currentTile = currentTile.parent
        }
        return result.reverse()
    }
    return undefined
}