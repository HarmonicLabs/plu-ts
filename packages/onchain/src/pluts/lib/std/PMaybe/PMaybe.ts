import { PDataRepresentable } from "../../../PType/PDataRepresentable";
import { PStruct, pstruct } from "../../../PTypes/PStruct/pstruct";
import { StructT, TermType, FromPType } from "../../../type_system";
import { _fromData } from "../data/conversion/fromData_minimal";

/*
TODO:
need to fix circular dependencies before implementing PMaybe methods
*/

export type MaybeT<T extends TermType> = StructT<{
    Just: { val: T },
    Nothing: {}
}/*, {
    unwrap: TermFn<[ PMaybeRawT<ToPType<T>> ], ToPType<T>>,
    default: TermFn<[ PMaybeRawT<ToPType<T>>, ToPType<T> ], ToPType<T>>,
}*/>


export type PMaybeT<PTy extends PDataRepresentable> = PStruct<{
    Just: { val: FromPType<PTy> },
    Nothing: {}
}, any/*{
    unwrap: TermFn<[ PMaybeRawT<PTy> ], PTy>,
    default: TermFn<[ PMaybeRawT<PTy>, PTy ], PTy>,
}*/>

export function PMaybe<T extends TermType>(tyArg: T)
{
    return pstruct({
        Just: { val: tyArg },
        Nothing: {}
    }/*, self_t => {

        return {
            unwrap: pfn([ self_t ], tyArg)
            ( self => _fromData( tyArg )( self.raw.fields.head ) ),
            default: pfn([ self_t, tyArg ], tyArg)
            (( self, defaultValue ) =>
                pmatch( self )
                .onJust(({ val }) => val)
                .onNothing(_ => defaultValue )
            )
        };
    }*/);
}