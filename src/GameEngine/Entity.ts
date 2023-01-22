import { InputMessage, TimestampedShareableData, Command, Vector } from "./helper/helper";

// =============================================================================
//  An Entity in the world.
// =============================================================================
export default class Entity {
    shareableData = 
    {
        position: new Vector(0,0),
        lastshot: new Vector(0,0)
    }

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
            this.shareableData.lastshot = input.commands[index].param as Vector
        }
    }
}