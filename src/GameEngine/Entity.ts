import { InputMessage, TimestampedShareableData, Command, Vector, Copyable } from "./helper/helper";

// =============================================================================
//  An Entity in the world.
// =============================================================================
export default class Entity {
    shareableData: EntityState = new EntityState(new Vector(0,0), new Vector(0,0))

    get x(): number {
        return this.shareableData.position.x;
    }

    get y(): number {
        return this.shareableData.position.y;
    }

    set x(x: number) {
        this.shareableData.position.x = x
    }

    set y(y: number) {
        this.shareableData.position.y = y
    }

    get shot_x(): number {
        return this.shareableData.lastshot.x
    }

    get shot_y(): number{
        return this.shareableData.lastshot.y
    }

    speed = 50; // units/s
    positionBuffer: TimestampedShareableData[] = [];
    entityId: number

    constructor(entityId: number) {
        this.entityId = entityId
    }

    spawned() {

    }

    // Apply user's input to this entity.
    applyInput(input: InputMessage) {
        if (input.commands.findIndex(c => c.command ==Command.goRight) >= 0)
            this.x += input.pressedTime * this.speed;

        if (input.commands.findIndex(c => c.command == Command.goLeft) >= 0)
            this.x += input.pressedTime * -this.speed;

        if (input.commands.findIndex(c => c.command == Command.goUp) >= 0)
            this.y += input.pressedTime * -this.speed;

        if (input.commands.findIndex(c => c.command == Command.goDown) >= 0)
            this.y += input.pressedTime * this.speed;
            
        const index = input.commands.findIndex(c => c.command == Command.shoot)
        if (index >= 0){
            this.shareableData.lastshot.x = input.commands[index].param.x
            this.shareableData.lastshot.y = input.commands[index].param.y
        }
    }
}

export class EntityState implements Copyable<EntityState>{
    position: Vector
    lastshot: Vector
    constructor(position: Vector, lastshot: Vector){
        this.position = position
        this.lastshot = lastshot
    }
    copy(): EntityState {
        return new EntityState(this.position.copy(), this.lastshot.copy())
    }
}