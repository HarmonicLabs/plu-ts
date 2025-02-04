import { PType } from "../../PType";
import { PData } from "../../PTypes/PData/PData";
import { PList } from "../../PTypes/PList";
import { SopInstance } from "../../PTypes/PSoP/psop";
import { Term } from "../../Term";
import { SopCtorDef, SopDefinition } from "../../../type_system";
import { TermList } from "../std/UtilityTerms/TermList";
import { UtilityTermOf } from "../std/UtilityTerms/addUtilityForType";

export type RawStructCtorCallback = ( mathcedCtorsFields: Term<PList<PData>> ) => Term<PType>;

export type EmptyObject = { [x: string | number | symbol ]: never };

export type MatchRest<PReturnT extends PType> = {
    _: ( continuation: ( mathcedCtorsFields: TermList<PData> ) => Term<PReturnT> ) => UtilityTermOf<PReturnT>
}

export type TypedPMatchOptions<SDef extends SopDefinition, PReturnT extends PType> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : ( cb: ( mathcedCtorsFields: SopInstance<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                UtilityTermOf<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & MatchRest<PReturnT>

export type MathcedCtorsFields<SCtorDef extends SopCtorDef> = SopInstance<SCtorDef> 

export type PMatchOptions<SDef extends SopDefinition> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : <PReturnT extends PType>( cb: ( mathcedCtorsFields: MathcedCtorsFields<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                UtilityTermOf<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & {
    _: <PReturnT extends PType>( continuation: ( mathcedCtorsFields: TermList<PData> ) => Term<PReturnT> ) => UtilityTermOf<PReturnT>
}