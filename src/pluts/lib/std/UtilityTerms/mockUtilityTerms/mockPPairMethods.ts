import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PType } from "../../../../PType";
import { PPair } from "../../../../PTypes/PPair";
import { Term } from "../../../../Term";
import { PrimType, TermType, bool, isWellFormedType, lam, pair, tyVar, typeExtends, unwrapAlias } from "../../../../../type_system";
import { TermPair } from "../TermPair";
import { makeMockUtilityTerm } from "./makeMockUtilityTerm";
import { unwrapAsData } from "../../../../../type_system/tyArgs/unwrapAsData";
import { makeMockTerm } from "./makeMockTerm";
import { makeMockTermBool } from "./mockPBoolMethods";
import { addBaseUtilityTerm } from "../BaseUtilityTerm";


const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function mockPPairMethods<PFst extends PType, PSnd extends PType>( _pair: Term<PPair<PFst,PSnd>>): TermPair<PFst,PSnd>
{
    _pair = addBaseUtilityTerm( _pair );

    const pairT = unwrapAlias( _pair.type );

    if( !typeExtends( pairT, pair( tyVar(), tyVar() ) ) )
    {
        throw new Error(
            "can't add pair methods to a term that is not a pair"
        );
    };

    // MUST NOT unwrap `asData`
    // (needed by pfst and psnd to understand if the result should be transformed)
    let fstT: TermType = pairT[1] as TermType;
    while( fstT[0] === PrimType.Alias ) fstT = fstT[1];

    // MUST NOT unwrap `asData`
    // (needed by pfst and psnd to understand if the result should be transformed) 
    let sndT: TermType = pairT[2] as TermType;
    while( sndT[0] === PrimType.Alias ) sndT = sndT[1];


    if( isWellFormedType( fstT ) )
        definePropertyIfNotPresent(
            _pair,
            "fst",
            {
                get: () => makeMockUtilityTerm(
                    // pfst automatically unwraps data
                    fstT[0] === PrimType.AsData ? 
                    unwrapAsData( fstT ) : 
                    fstT 
                ),
                ...getterOnly
            }
        );
    if( isWellFormedType( sndT ) )
        definePropertyIfNotPresent(
            _pair,
            "snd",
            {
                get: () => makeMockUtilityTerm(
                    // psnd automatically unwraps data
                    sndT[0] === PrimType.AsData ? 
                    unwrapAsData( sndT ) : 
                    sndT 
                ),
                ...getterOnly
            }
        );

    definePropertyIfNotPresent(
        _pair,
        "peq",
        {
            get: () => makeMockTerm( lam( pairT, bool )),
            set: () => {},
            enumerable: true,
            configurable: false
        }
    );
    defineReadOnlyProperty(
        _pair,
        "eq",
        ( other: any ) => makeMockTermBool()
    );

    return _pair as any;
}