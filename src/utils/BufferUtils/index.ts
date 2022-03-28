import { Buffer } from "buffer";

export default
class BufferUtils
{
    private constructor() {};

    static copy( buffer: Buffer ): Buffer
    {
        return Buffer.from( buffer )
    }
}