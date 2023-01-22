
export class TimestampedShareableData {
    timestamp: number
    shareableData: any
    constructor(ts: number, p: any) {
        this.timestamp = ts;
        this.shareableData = p
    }
}

export class Message {
}

export class MessageContainer {
    recvTs: number
    message: string

    constructor(recvTs: number, payload: string) {
        this.recvTs = recvTs
        this.message = payload
    }
}

export class Vector{
    x: number
    y: number
    constructor(x:number,y:number){
        this.x = x
        this.y = y
    }
}

export class CommandData{
    command: Command
    param: any
    constructor(command:Command, param: any = null){
        this.command=command
        this.param = param
    }
}

export enum Command {
    goUp,
    goDown,
    goLeft,
    goRight,
    shoot
}

export class InputMessage extends Message {
    commands: CommandData[]
    entityId :number
    pressedTime  :number
    inputSequenceNumber :number
    constructor(entityId: number, 
        pressedTime: number, 
        inputSequenceNumber: number,
        commands: CommandData[]) {
        super()
        this.entityId = entityId
        this.pressedTime = pressedTime
        this.inputSequenceNumber = inputSequenceNumber
        this.commands = commands
    }
}

export class WorldStateMessage extends Message {
    entityId: number
    shareableData: any
    lastProcessedInput: number
    constructor(entityId: number, shareableData: any, lastProcessedInput: number) {
        super()
        this.entityId = entityId
        this.shareableData = shareableData
        this.lastProcessedInput = lastProcessedInput
    }
}

