import DataB from "./DataB";
import DataConstr from "./DataConstr";
import DataI from "./DataI";
import DataList from "./DataList";
import DataMap from "./DataMap";
import DataPair from "./DataPair";

type Data 
    = DataConstr
//    | DataPair<Data,Data>
    | DataMap<Data,Data>
    | DataList
    | DataI
    | DataB;

export default Data;

export function isData( something: any ): something is Data
{
    const proto = Object.getPrototypeOf( something );

    return (
        proto === DataConstr.prototype ||
        proto === DataMap.prototype    ||
        proto === DataList.prototype   ||
        proto === DataI.prototype      ||
        proto === DataB.prototype
    );
}

export function eqData( a: Data, b: Data ): boolean
{
    // not necessary since prototypes need to be checked anyways
    // if( !isData( a ) ) return false;
    // if( !isData( b ) ) return false;

    const aProto = Object.getPrototypeOf( a );
    const bProto = Object.getPrototypeOf( b );

    if( aProto !== bProto ) return false;

    if( aProto === DataConstr.prototype )
    {
        return (
            (a as DataConstr).constr.asBigInt === (b as DataConstr).constr.asBigInt &&
            (a as DataConstr).fields.length === (b as DataConstr).fields.length &&
            (a as DataConstr).fields.every(
                (aField, idx) => eqData( aField, (b as DataConstr).fields[ idx ] ) 
            )
        );
    }
    if( aProto === DataMap.prototype )
    {
        type D = DataMap<Data,Data>;
        return (
            (a as D).map.every(
                (entry, idx) => {
                    const bEntry = (b as D).map[ idx ];
                    return (
                        eqData( entry.fst, bEntry.fst ) &&
                        eqData( entry.snd, bEntry.snd )
                    );
                }
            )
        );
    }
    if( aProto === DataList.prototype )
    {
        return (
            (a as DataList).list.every(
                ( elem, idx ) => eqData( elem, (b as DataList).list[ idx ] )
            ) 
        );
    }
    if( aProto === DataI.prototype )
    {
        return (
            (a as DataI).int.asBigInt === (b as DataI).int.asBigInt
        );
    }
    if( aProto === DataB.prototype )
    {
        return (
            (a as DataB).bytes.asString === (b as DataB).bytes.asString
        );
    }

    return false;
}