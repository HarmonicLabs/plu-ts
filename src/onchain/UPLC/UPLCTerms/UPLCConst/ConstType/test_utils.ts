import { ConstType, constT, ConstTyTag } from ".";

export function makeRandomWellFormed(): ConstType
{
    const types: ConstType[] = [
        constT.int,
        constT.byteStr,
        constT.str,
        constT.bool,
        constT.unit,
        constT.data,
        [ ConstTyTag.list ],
        [ ConstTyTag.pair ]
    ];

    let i = Math.round(
        Math.random() * (types.length - 1)
    );

    if( i === types.length - 1 )
    {
        return constT.pairOf(
            makeRandomWellFormed(),
            makeRandomWellFormed()
        )
    }
    else if( i === types.length - 2 )
    {
        return constT.listOf(
            makeRandomWellFormed()
        )
    }

    return types[i];
}