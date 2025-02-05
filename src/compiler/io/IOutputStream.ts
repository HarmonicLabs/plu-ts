import { fromUtf8, concatUint8Array, toUtf8 } from "@harmoniclabs/uint8array-utils";

/** A compatible output stream. */
export interface IOutputStream {
    /** Writes a chunk of data to the stream. */
    write(chunk: Uint8Array | string): void;
}

export class ConsoleLogStream implements IOutputStream {
    write(chunk: Uint8Array | string): void {
        if (chunk instanceof Uint8Array) {
            console.log( toUtf8( chunk ) );
        } else {
            console.log( chunk.toString() );
        }
    }
}

export class ConsoleErrorStream implements IOutputStream {
    write(chunk: Uint8Array | string): void {
        if (chunk instanceof Uint8Array) {
            console.error( toUtf8( chunk ) );
        } else {
            console.error( chunk.toString() );
        }
    }
}

/** An in-memory output stream. */
export interface IMemoryStream extends IOutputStream {
    /** Resets the stream to offset zero. */
    reset(): void;
    /** Converts the output to a buffer. */
    toBuffer(): Uint8Array;
    /** Converts the output to a string. */
    toString(): string;
}

export class MemoryStream implements IMemoryStream {
    private chunks: Uint8Array[];

    constructor()
    {
        this.chunks = [];
    }

    write(chunk: Uint8Array | string): void
    {
        if (typeof chunk === "string") {
            this.chunks.push( fromUtf8( chunk ) );
        } else {
            this.chunks.push( chunk );
        }
    }

    reset(): void
    {
        this.chunks.length = 0;
    }

    toBuffer(): Uint8Array {
        return concatUint8Array(...this.chunks);
        // return new Uint8Array(this.toString().length);
    }

    toString(): string {
        return this.chunks.map( chunk => toUtf8( chunk ) ).join("");
    }
}