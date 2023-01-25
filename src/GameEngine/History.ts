import { Copyable } from "./helper/helper";

export default class History<T extends Copyable<T>> {
    tickRate: number = 0;
    records: Record<T>[] = [];

    constructor() {

    }

    setTickRate(tickRate: number/*, p0data:any, p1data:any*/) {
        this.tickRate = tickRate
        this.records = new Array(tickRate + 1)
        // this.records.fill(new Record)
        for (let index = 0; index < this.records.length; index++) {
            this.records[index] = new Record
        }
    }

    getRecord(tick: number) {
        return this.records[tick]
    }

    nextTick() {
        console.log("%c nextTick", "color: blue")
        let record = this.records[0].copy()
        this.records.splice(0, 0, record)
        this.records.pop()
    }

    setRecord(id: number, data: T) {
        this.records[0].setData(id, data.copy())
    }
}

export class Record<T extends Copyable<T>> implements Copyable<Record<T>> {
    p0data: T|undefined = undefined
    p1data: T|undefined = undefined

    getData(id: number): T|undefined {
        return id == 0 ? this.p0data : this.p1data
    }

    setData(id: number, data: T) {
        if (id == 0) {
            this.p0data = data
        }
        else {
            this.p1data = data
        }
    }

    copy(): Record<T> {
        var cop = new Record<T>()
        cop.p0data = this.p0data != undefined ? this.p0data.copy() : undefined;
        cop.p1data = this.p1data != undefined ? this.p1data.copy() : undefined;
        return cop
    }
}