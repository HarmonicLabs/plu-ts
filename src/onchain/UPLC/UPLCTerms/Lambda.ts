import UPLCSerializable, { UPLCSerializationContex } from "../../../serialization/flat/ineterfaces/UPLCSerializable";
import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";

export default class Lambda
    implements UPLCSerializable
{
    private static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0010" )
        );
    }
    
    private _body : UPLCTerm;

    get body(): UPLCTerm
    {
        return this._body;
    }

    constructor( body: UPLCTerm )
    {
        this._body = body
    }

    toUPLCBitStream( ctx: UPLCSerializationContex ): BitStream
    {
        const result = Lambda.UPLCTag.clone();
        ctx.updateWithBitStreamAppend( result );

        /*
        only the body of the lambda is encoded since the new variable is implicit
        this is not referencied in any current specification but it is present in the `plutus` source code:

        Here is where they called encode with the binder while encoding a Lambda Term

        https://github.com/input-output-hk/plutus/blob/c8d4364d0e639fef4d5b93f7d6c0912d992b54f9/plutus-core/untyped-plutus-core/src/UntypedPlutusCore/Core/Instance/Flat.hs#L110


        Here is where binder is defined

        https://github.com/input-output-hk/plutus/blob/c8d4364d0e639fef4d5b93f7d6c0912d992b54f9/plutus-core/plutus-core/src/PlutusCore/Core/Type.hs#L228


        And (most importantly) where flat encoding for binder is derived

        https://github.com/input-output-hk/plutus/blob/c8d4364d0e639fef4d5b93f7d6c0912d992b54f9/plutus-core/plutus-core/src/PlutusCore/Flat.hs#L354
        */
        UPLCFlatUtils.appendTermAndUpdateContext(
            result,
            this.body,
            ctx
        );

        return result;
    }
}