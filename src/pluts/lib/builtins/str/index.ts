import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { PLam, PString, PBool, PByteString } from "../../../PTypes";
import { Term } from "../../../Term";
import { fn, str, bool, lam, bs } from "../../../../type_system";
import { papp } from "../../papp";
import { PappArg } from "../../pappArg";
import { TermBS, addPByteStringMethods } from "../../std/UtilityTerms/TermBS";
import { TermBool, addPBoolMethods } from "../../std/UtilityTerms/TermBool";
import { TermStr, addPStringMethods } from "../../std/UtilityTerms/TermStr";


export type StrBinOPToStr = Term<PLam<PString, PLam<PString,PString>>>
& {
    $: ( input: PappArg<PString> ) => 
        Term<PLam<PString,PString>>
        & {
            $: ( input: PappArg<PString> ) => 
                TermStr
        }
}

export const pappendStr: StrBinOPToStr = (() => {
    const op = new Term<PLam<PString, PLam<PString,PString>>>(
        fn([ str, str ], str ),
        _dbn => IRNative.appendString
    );

    return  defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PString> ): Term<PLam<PString, PString>> => {
            const oneIn =
                papp( op, fstIn );

            return defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PString> ): TermStr => {
                    return addPStringMethods( papp( oneIn, sndIn ) )
                }
            ) as any;
        }
    ) as any;
})();

export type StrBinOPToBool = Term<PLam<PString,PLam<PString, PBool>>>
& {
    $: ( input: PappArg<PString> ) => 
        Term<PLam<PString,PBool>>
        & {
            $: ( input: PappArg<PString> ) => 
                TermBool
        }
}
export const peqStr: StrBinOPToBool = (() => {
    const op = new Term<PLam<PString,PLam<PString, PBool>>>(
        fn([ str, str ], bool ),
        _dbn => IRNative.equalsString,
    );

    return  defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PString> ): Term<PLam<PString, PBool>> => {
            const oneIn = papp( op, fstIn );

            return defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PString> ): TermBool => {
                    return addPBoolMethods( papp( oneIn, sndIn ) )
                }
            ) as any;
        }
    ) as any;
})();

export const pencodeUtf8: Term<PLam<PString, PByteString>>
& {
    $: ( str: PappArg<PString> ) => TermBS
} = (() => {
    const encodeUtf8  =new Term<PLam<PString, PByteString>>(
            lam( str, bs ),
            _dbn => IRNative.encodeUtf8
        );

    return defineReadOnlyProperty(
        encodeUtf8,
        "$",
        ( str: PappArg<PString> ): TermBS => addPByteStringMethods( papp( encodeUtf8, str ) )
    )
})()

export const pdecodeUtf8: Term<PLam<PByteString, PString>>
& {
    $: ( str: PappArg<PByteString> ) => TermStr
} = (() => {
    const decodeUtf8  =new Term<PLam<PByteString, PString>>(
        lam( bs, str ),
        _dbn => IRNative.decodeUtf8,
        );

    return defineReadOnlyProperty(
        decodeUtf8,
        "$",
        ( byteStr: PappArg<PByteString> ): TermStr => addPStringMethods( papp( decodeUtf8, byteStr ) )
    )
})()
