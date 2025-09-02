import { fromUtf8, concatUint8Array, toUtf8 } from "@harmoniclabs/uint8array-utils";

/** A compatible output stream. */
export interface IOutputStream {
    /** Writes a chunk of data to the stream. */
    write(chunk: Uint8Array | string): void;
}

export class ConsoleLogStream implements IOutputStream {
    private _pending: string = "";
    write(chunk: Uint8Array | string): void {
        const newChunk = (chunk instanceof Uint8Array) ? toUtf8( chunk ): chunk.toString()
        if( newChunk.includes("\n") )
        {
            const parts = newChunk.split("\n");
            if(parts.length === 1)
            {
                // only one \n
                console.log( this._pending + parts[0] );
                this._pending = "";
            }
            else
            {
                // multiple \n
                console.log( this._pending + parts[0] );
                for( let i = 1; i < parts.length - 1; i++ )
                {
                    console.log( parts[i] );
                }
                this._pending = parts[ parts.length - 1 ];
            }
        }
        else
        {
            this._pending += newChunk;
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