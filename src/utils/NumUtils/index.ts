

export default class NumUtils
{
    constructor() {}

    static get POW_2_32(): number { return 4294967296; }

    /**
     * greather than max js safe integer
     * ```js
     * Number.MAX_SAFE_INTEGER + 1
     * ```
     */
    static get POW_2_53(): bigint { return BigInt( "9007199254740992" ); }
}