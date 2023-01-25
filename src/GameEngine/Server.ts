
import Entity, { EntityState } from './Entity'
import LagNetwork from './LagNetwork'
import Client from './Client'

import { InputMessage, WorldStateMessage, Command, Vector } from "./helper/helper";
import History from './History';

// =============================================================================
//  The Server.
// =============================================================================

type HistoryDataType = EntityState

export default class Server {

    // Connected clients and their entities.
    clients: Client[] = [];
    entities: Entity[] = [];
    history: History<HistoryDataType> = new History<HistoryDataType>()

    // Last processed input for each client.
    lastProcessedInput: number[] = [];

    // Simulated network connection.
    network = new LagNetwork();

    updateRate = 0
    updatePeriod = 0
    maxPressedTimeForValidation = 1 / 10

    pixiApp: PIXI.Application;
    status: HTMLElement;
    updateIntervalId: number
    initializeWordRendering: Function

    constructor(pixiApp: PIXI.Application, status: HTMLElement, initializeWordRendering: Function) {
        this.initializeWordRendering = initializeWordRendering

        // UI.
        this.pixiApp = pixiApp
        this.status = status
        this.updateIntervalId = 0

        // Default updte rate.
        this.setUpdateRate(20)

    }

    connect(client: Client) {

        // Give the Client enough data to identify itself.
        client.setEntityId(this.clients.length);
        this.clients.push(client);

        // Create a new Entity for this Client.
        const entity = new Entity(client.entityId);
        this.entities.push(entity);

        // entity.entityId = client.entityId;

        // Set the initial state of the Entity (e.g. spawn point)
        const spawnPointsX = [
            920 / 3 * 1,
            920 / 3 * 2
        ];
        const spawnPointY = 75 / 2;
        entity.x = spawnPointsX[client.entityId];
        entity.y = spawnPointY;
        this.initializeWordRendering(this.pixiApp, this.entities)
    }

    getUpdateRate() {
        return this.updateRate;
    }
    setMaxPressedTimeForValidation(maxPressedTimeForValidation: number) {
        // 1 / 10
        this.maxPressedTimeForValidation = maxPressedTimeForValidation;
    }
    setUpdateRate(hz: number) {
        var self = this

        this.updateRate = hz;
        this.updatePeriod = 1/hz
        this.history.setTickRate(this.updateRate)

        clearInterval(this.updateIntervalId);

        this.updateIntervalId = window.setInterval(() => {
            self.update();
        }, 1000 / this.updateRate);
    }

    update() {
        this.processInputs();
        this.sendWorldState();
    }

    // Check whether this input seems to be valid (e.g. "make sense" according
    // to the physical rules of the World)
    validateInput(input: InputMessage) {
        if (Math.abs(input.pressedTime * 1000) > this.maxPressedTimeForValidation) {
            console.log('The maximum accepted pressed key time was', input.pressedTime * 1000, 'ms, and therefore was discarded by the server. Try to increase the "maximum accepted press time in the server view."');
            return false;
        }
        return true;
    }

    processInputs() {
        // Process all pending messages from clients.
        this.history.nextTick()

        while (true) {

            const message = this.network.receive() as InputMessage;
            if (!message) {
                break;
            }

            // Update the state of the entity, based on its input.
            // We just ignore inputs that don't look valid;
            // this is what prevents clients from cheating.
            if (this.validateInput(message)) {
                const id = message.entityId;
                this.entities[id].applyInput(message);
                this.history.setRecord(id, this.entities[id].shareableData)
                this.headshotCheck(message)

                // remember last input sequence number for client because?
                this.lastProcessedInput[id] = message.inputSequenceNumber;
            }

        }

        // Show some info.
        let info = "Last acknowledged input: ";
        for (let i = 0; i < this.clients.length; ++i) {
            info += `Player ${i}: #${this.lastProcessedInput[i] || 0}   `;
        }
        this.status.textContent = info;
    }

    headshotCheck(message: InputMessage){
        const index = message.commands.findIndex(c => c.command == Command.shoot)
        if(index >= 0){
            const lag = this.clients[message.entityId].lag
            const tick = Math.round(lag / this.updatePeriod / 1000)
            console.log("tick", tick)
            if(tick >= this.updateRate){
                console.log("its too much")
                return
            }
            const enemyRecord = this.history.getRecord(tick).getData(1-message.entityId)//this.entities[1-message.entityId]
            if(enemyRecord == null)
                return

            const target = message.commands[index].param as Vector
            const distance = Math.sqrt(Math.pow(target.x - enemyRecord.position.x,2)+Math.pow(target.y-enemyRecord.position.y,2))

            if (distance < 20){
                console.log("%c HEADSHOT", "color: green", `Player ${message.entityId} -> Player ${1-message.entityId}`)
            }
            else{
                console.log("%c MISSED", "color: red", `Player ${message.entityId} -> Player ${1-message.entityId}`)
            }
        }
    }

    // Send the world state to all the connected clients.
    sendWorldState() {
        // Gather the state of the world.
        // In a real app, state could be filtered to avoid leaking data
        // (e.g. position of invisible enemies).

        const worldStateArray: WorldStateMessage[] = [];
        const clientsCount = this.clients.length;
        for (var i = 0; i < clientsCount; i++) {
            const entity = this.entities[i];
            worldStateArray.push(new WorldStateMessage(
                entity.entityId,
                entity.shareableData,
                this.lastProcessedInput[i]
            ));
        }

        // Broadcast the state to all the clients.
        for (var i = 0; i < clientsCount; i++) {
            const client = this.clients[i];
            client.network.send(client.lag, worldStateArray);
        }
    }
}
