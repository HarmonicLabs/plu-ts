import DataB from "./DataB";
import DataConstr from "./DataConstr";
import DataI from "./DataI";
import DataList from "./DataList";
import DataMap from "./DataMap";
import DataPair from "./DataPair";

type Data 
    = DataConstr
    | DataPair<Data,Data>
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