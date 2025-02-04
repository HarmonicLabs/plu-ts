import { definePropertyIfNotPresent, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PType } from "../../../PType";
import { PAsData, PBool, PPair, TermFn } from "../../../PTypes";
import { Term } from "../../../Term";
import { FromPType, isWellFormedType, typeExtends, unwrapAlias } from "../../../../type_system";
import { tyVar, pair, TermType, PrimType, PairT } from "../../../../type_system/types";
import { UtilityTermOf } from "./addUtilityForType";
import { pfstPair, psndPair } from "../../builtins/pair";
import { plet } from "../../plet";
import { PappArg } from "../../pappArg";
import { TermBool } from "./TermBool";
import { peqPair } from "../pair";
import { addBaseUtilityTerm, BaseUtilityTermExtension } from "./BaseUtilityTerm";

type UnwrapPAsData<PT extends PType> = 
    PT extends PAsData<infer PTy extends PType> ? PTy :
    PT

export type TermPair<PFst extends PType, PSnd extends PType> = Term<PPair<PFst,PSnd>> & BaseUtilityTermExtension & {

    readonly fst: UtilityTermOf<UnwrapPAsData<PFst>>

    readonly snd: UtilityTermOf<UnwrapPAsData<PSnd>>

    readonly peq: TermFn<[ PPair<PFst,PSnd> ], PBool>
    readonly eq:  ( other: PappArg<PPair<PFst,PSnd>> ) => TermBool
}

const getterOnly = {
    set: () => {},
    configurable: false,
    enumerable: true
};

export function addPPairMethods<PFst extends PType, PSnd extends PType>( _pair: Term<PPair<PFst,PSnd>>): TermPair<PFst,PSnd>
{
    _pair = addBaseUtilityTerm( _pair );

    const pairT = unwrapAlias( _pair.type ) as PairT<FromPType<PFst>,FromPType<PSnd>>;

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
                get: () => plet( pfstPair( fstT, sndT ).$( _pair ) ),
                ...getterOnly
            }
        );
    if( isWellFormedType( sndT ) )
        definePropertyIfNotPresent(
            _pair,
            "snd",
            {
                get: () => plet( psndPair( fstT, sndT ).$( _pair ) ),
                ...getterOnly
            }
        );

    definePropertyIfNotPresent(
        _pair,
        "peq",
        {
            get: () => peqPair( pairT ).$( _pair as any ),
            set: () => {},
            enumerable: true,
            configurable: false
        }
    );
    defineReadOnlyProperty(
        _pair,
        "eq",
        ( other: any ): TermBool => peqPair( pairT ).$( _pair as any ).$( other )
    );

    return _pair as any;
}