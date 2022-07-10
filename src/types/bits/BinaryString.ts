import JsRuntime from "../../utils/JsRuntime";

export default class BinaryString
{
    private _bin: string;

    protected set bin( binString: string )
    {
        this._bin = binString.toLowerCase();
    }

    constructor( binString : string )
    {
        JsRuntime.assert(
            typeof binString == "string",
            "expected a string to buid a 'BinaryString' object"
        )

        // remove spaces
        binString = binString.trim().split(" ").join("").toLowerCase();

        // the string may contain invalid chars
        BinaryString._assertBinary( binString );

        this._bin = binString.toLowerCase();
    }

    get asString(): string
    {
        return this._bin;
    }

    /**
     * 
     * @param anyString assumed bin string
     * @returns true if the string can be interpreted as binadecimal value
     */
    public static isBinary( anyString: string ): boolean
    {
        // always think in javasript
        if( typeof anyString !== "string" ) return false;
        
        const str = anyString.toLowerCase();
        const validBinaryDigits = "01";

        for( let i = 0; i < str.length; i++)
        {
            if( !validBinaryDigits.includes(str[i]) ) return false;
        }

        // if false has not been returned yet, then it must be a valid bin
        return true;
    }

    private static _assertBinary( str: string ) : void
    {
        if( !BinaryString.isBinary( str ) ) throw new Error("provided string is expected to be a valid bin value; inpur was: " + str);
    }
    
}