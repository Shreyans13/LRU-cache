
// const max8 = Math.pow(2, 8) - 1 
// const max16 = Math.pow(2, 16) - 1 
// const max32 = Math.pow(2, 32) - 1 


export class LRUCache<K extends string | number | symbol, V extends string | number | symbol> {
    private capacity: number
    private constants: {
        MAX_INTEGER_8BIT: 255
        MAX_INTEGER_16BIT: 65535
        MAX_INTEGER_32BIT: 4294967295
    }
    private forward: Uint16Array<ArrayBuffer> | Uint8Array<ArrayBuffer> | Uint32Array<ArrayBuffer>
    private backward: Uint16Array<ArrayBuffer> | Uint8Array<ArrayBuffer> | Uint32Array<ArrayBuffer>
    private KeyList: K[];
    private ValueList: V[];
    private size: number
    private head: number
    private tail: number
    private items: Record<K, number>

    private getPointerArray = (size: number): Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | null => {
        const maxIndex = size - 1;

        return maxIndex <= this.constants.MAX_INTEGER_8BIT
            ? Uint8Array : maxIndex <= this.constants.MAX_INTEGER_16BIT
                ? Uint16Array : maxIndex <= this.constants.MAX_INTEGER_32BIT ? Uint32Array : null
    }

    constructor(capacity: number, Keys: new (size: number) => K[], Values: new (size: number) => V[]) {
        if (capacity <= 0)
            throw new Error("CAPACITY_SHOULD_BE_POSITIVE")
        if (!Number.isFinite(capacity) || Math.floor(capacity) !== capacity)
            throw new Error("CAPACITY_SHOULD_BE_POSITIVE")
        const PointerArray = this.getPointerArray(capacity)
        if (PointerArray == null)
            throw new Error("CAPACITY_NOT_SUPPORTED")
        this.constants = {
            MAX_INTEGER_8BIT: 255,
            MAX_INTEGER_16BIT: 65535,
            MAX_INTEGER_32BIT: 4294967295
        }
        this.backward = new PointerArray()
        this.forward = new PointerArray()

        this.KeyList = typeof Keys == 'function' ? new Keys(capacity) : new Array<K>(capacity)
        this.ValueList = typeof Keys == 'function' ? new Values(capacity) : new Array<V>(capacity)

        this.size = 0;
        this.head = 0;
        this.tail = 0;
        this.capacity = capacity;
        this.items = {} as Record<K, number>;
    }

    private updatePointers = (pointer: number) => {
        const oldHead = this.head;
        const previous = this.backward[pointer]
        const next = this.forward[pointer]

        if (this.head == pointer) return this;
        else if (this.tail == pointer)
            this.tail = previous
        else
            this.backward[next] = previous

        this.forward[previous] = next
        this.backward[oldHead] = pointer
        this.head = pointer
        this.forward[pointer] = oldHead

        return this;
    }

    public clear = () => {
        this.size = 0;
        this.head = 0;
        this.tail = 0;
        this.items = {} as Record<K, number>;;
    }

    public set = (key: K, value: V) => {
        let pointer = this.items[key];

        if (pointer !== undefined) {
            this.updatePointers(pointer)
            this.ValueList[pointer] = value
        } else {
            if (this.size < this.capacity)
                pointer = this.size++;
            else {
                pointer = this.tail
                this.tail = this.backward[pointer]
                delete this.items[this.KeyList[pointer]] // eslint-disable-line @typescript-eslint/no-dynamic-delete
            }
            this.items[key] = pointer;
            this.KeyList[pointer] = key;
            this.ValueList[pointer] = value;

            this.forward[pointer] = this.head;
            this.backward[this.head] = pointer;
            this.head = pointer;
        }


    }

    public has = (key: K) => key in this.items

    public peek = (key: K) => {
        const pointer = this.items[key];
        if (typeof pointer === "undefined") return null;
        return this.ValueList[pointer]
    }
}