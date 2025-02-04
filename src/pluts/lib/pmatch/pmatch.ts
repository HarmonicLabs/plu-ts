import { PrimType, SopDefinition, StructCtorDef, StructDefinition, TermType, data, list } from "../../../type_system/types";
import type { Term } from "../../Term";
import { PStruct } from "../../PTypes/PStruct/pstruct";
import { termTypeToString } from "../../../type_system/utils";
import type { PSop } from "../../PTypes/PSoP/psop";
import { isTaggedAsAlias, unwrapAlias } from "../../../type_system";
import { pmatchStruct } from "./pmatchStruct";
import { pmatchSop } from "./pmatchSop";
import { PMatchOptions } from "./PMatchOptions";

export function pmatch<SDef extends SopDefinition>( term: Term<PStruct<SDef, {}>> | Term<PSop<SDef, {}>> ): PMatchOptions<SDef>
{
    let t: TermType = term.type as any;
    t = isTaggedAsAlias( t as any ) ? unwrapAlias( t ) : t;

    if( t[0] === PrimType.Struct ) return pmatchStruct<SDef>( term as any );
    else if( t[0] === PrimType.Sop ) return pmatchSop<SDef>( term as any );
    
    throw new Error(
        "invalid term to match; term type is: " +
        termTypeToString( term.type )
    );
}