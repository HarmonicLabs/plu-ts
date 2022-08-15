import DataB from "./DataB";
import DataConstr from "./DataConstr";
import DataI from "./DataI";
import DataList from "./DataList";
import DataMap from "./DataMap";

type Data 
    = DataConstr
    | DataMap
    | DataList
    | DataI
    | DataB;

export default Data;

export function isData( something: Data ): boolean
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