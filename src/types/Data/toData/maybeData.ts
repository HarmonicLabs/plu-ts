import { Data } from "../Data";
import { DataConstr } from "../DataConstr";

export function nothingData(): DataConstr
{
    return new DataConstr( 1, [] );
}

export function justData( someData: Data ): DataConstr
{
    return new DataConstr(
        0, [ someData ]
    )
}

export function maybeData( optionalData: Data | undefined ): DataConstr
{
    return optionalData === undefined ? nothingData() : justData( optionalData );
}