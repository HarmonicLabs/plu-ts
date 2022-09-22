import UPLCTerm from "../../UPLC/UPLCTerm";
import UPLCBuiltinTag from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";


export default class PartialBuiltin
{
    private _tag: UPLCBuiltinTag;
    private _args: UPLCTerm[];
    private _nRequiredArgs: number;

    get tag(): UPLCBuiltinTag { return this._tag; }
    get args(): UPLCTerm[] { return this._args; }

    constructor( tag: UPLCBuiltinTag )
    {
        this._tag = tag;
        this._args = [];
        this._nRequiredArgs = PartialBuiltin.getNRequiredArgsFor( tag );
    }

    get nMissingArgs(): number
    {
        return this._nRequiredArgs - this._args.length;
    }

    apply( arg: UPLCTerm ): void
    {
        this._args.push( arg );
    }

    /**
     * @todo
     */
    static getNRequiredArgsFor( tag: UPLCBuiltinTag ): ( 0 | 1 | 2 | 3 | 6 )
    {
        switch( tag )
        {
            case UPLCBuiltinTag.addInteger :                    return 2;
            case UPLCBuiltinTag.subtractInteger :               return 2;
            case UPLCBuiltinTag.multiplyInteger :               return 2;
            case UPLCBuiltinTag.divideInteger :                 return 2;
            case UPLCBuiltinTag.quotientInteger :               return 2;
            case UPLCBuiltinTag.remainderInteger :              return 2;
            case UPLCBuiltinTag.modInteger :                    return 2;
            case UPLCBuiltinTag.equalsInteger :                 return 2;
            case UPLCBuiltinTag.lessThanInteger :               return 2;
            case UPLCBuiltinTag.lessThanEqualInteger :          return 2;
            case UPLCBuiltinTag.appendByteString :              return 2;
            case UPLCBuiltinTag.consByteString :                return 2;
            case UPLCBuiltinTag.sliceByteString :               return 3;
            case UPLCBuiltinTag.lengthOfByteString :            return 1;
            case UPLCBuiltinTag.indexByteString :               return 2;
            case UPLCBuiltinTag.equalsByteString :              return 2;
            case UPLCBuiltinTag.lessThanByteString :            return 2;
            case UPLCBuiltinTag.lessThanEqualsByteString :      return 2;
            case UPLCBuiltinTag.sha2_256 :                      return 1;
            case UPLCBuiltinTag.sha3_256 :                      return 1;
            case UPLCBuiltinTag.blake2b_256 :                   return 1;
            case UPLCBuiltinTag.verifyEd25519Signature:         return 3;
            case UPLCBuiltinTag.appendString :                  return 2;
            case UPLCBuiltinTag.equalsString :                  return 2;
            case UPLCBuiltinTag.encodeUtf8 :                    return 1;
            case UPLCBuiltinTag.decodeUtf8 :                    return 1;
            case UPLCBuiltinTag.ifThenElse :                    return 3;
            case UPLCBuiltinTag.chooseUnit :                    return 2;
            case UPLCBuiltinTag.trace :                         return 2;
            case UPLCBuiltinTag.fstPair :                       return 1;
            case UPLCBuiltinTag.sndPair :                       return 1;
            case UPLCBuiltinTag.chooseList :                    return 3;
            case UPLCBuiltinTag.mkCons :                        return 2;
            case UPLCBuiltinTag.headList :                      return 1;
            case UPLCBuiltinTag.tailList :                      return 1;
            case UPLCBuiltinTag.nullList :                      return 1;
            case UPLCBuiltinTag.chooseData :                    return 6;
            case UPLCBuiltinTag.constrData :                    return 2;
            case UPLCBuiltinTag.mapData :                       return 1;
            case UPLCBuiltinTag.listData :                      return 1;
            case UPLCBuiltinTag.iData    :                      return 1;
            case UPLCBuiltinTag.bData    :                      return 1;
            case UPLCBuiltinTag.unConstrData :                  return 1;
            case UPLCBuiltinTag.unMapData    :                  return 1;
            case UPLCBuiltinTag.unListData   :                  return 1;
            case UPLCBuiltinTag.unIData      :                  return 1;
            case UPLCBuiltinTag.unBData      :                  return 1;
            case UPLCBuiltinTag.equalsData   :                  return 2;
            case UPLCBuiltinTag.mkPairData   :                  return 2;
            case UPLCBuiltinTag.mkNilData    :                  return 1;
            case UPLCBuiltinTag.mkNilPairData:                  return 1;
            case UPLCBuiltinTag.serialiseData:                  return 1;
            case UPLCBuiltinTag.verifyEcdsaSecp256k1Signature:  return 3;
            case UPLCBuiltinTag.verifySchnorrSecp256k1Signature:return 3;

            
            default:
                // tag; // check that is of type 'never'
                return 0;
        }
    }
}