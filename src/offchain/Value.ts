import Hash32 from "./hashes/Hash32/Hash32";


export type IValue = {
    policy: Hash32,
    assets: {
        [assetNameAscii: string]: number | bigint
    }
}[]

export class Value
{
    readonly map: IValue

    constructor( map: IValue )
    {
        
    }
}

export default Value;