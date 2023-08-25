import { PType } from "../../../../PType";
import { PLam } from "../../../../PTypes/PFn/PLam";
import { Term } from "../../../../Term";
import { makeMockTerm } from "./makeMockTerm";

export function mockPapp<PIn extends PType, POut extends PType>( a: Term<PLam<PIn, POut>>, b: Term<PIn> ): Term<POut>
{
    const outT = a.type[2];
    if( outT === undefined )
    {
        console.log( a.type );
    }
    return makeMockTerm( outT as any ) as any;
} 