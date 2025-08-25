import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirLitObjExpr } from "./TirLitObjExpr";
import { TirType } from "../../types/TirType";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";
import { isObject } from "util";
import { IRTerm, IRConstr } from "../../../../IR";
import { data_t } from "../../program/stdScope/stdScope";
import { TirAliasType } from "../../types/TirAliasType";
import { TirSopOptT, TirFuncT, TirPairDataT, TirListT } from "../../types/TirNativeType";
import { TirDataStructType, TirSoPStructType } from "../../types/TirStructType";
import { TirTypeParam } from "../../types/TirTypeParam";
import { getUnaliased } from "../../types/utils/getUnaliased";
import { TirCallExpr } from "../TirCallExpr";
import { TirNativeFuncExpr } from "../TirNativeFuncExpr";
import { TirToDataExpr } from "../TirToDataExpr";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { TirLitArrExpr } from "./TirLitArrExpr";
import { TirLitIntExpr } from "./TirLitIntExpr";
import { NamedExpr } from "../utils/NamedExpr";

export class TirLitNamedObjExpr
    implements ITirExpr, ITirLitObjExpr
{
    get isConstant(): boolean
    {
        return this.values.every( value => value.isConstant );
    }

    constructor(
        readonly name: Identifier,
        readonly fieldNames: Identifier[],
        readonly values: TirExpr[],
        readonly type: TirSoPStructType | TirDataStructType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        return this.values.reduce((deps, value) => {
            const valueDeps = value.deps();
            mergeSortedStrArrInplace( deps, valueDeps );
            return deps;
        }, []);
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        const type = this.type;

        const ctorIdx = type.constructors.findIndex( c => c.name === this.name.text );
        if( ctorIdx < 0 )
        throw new Error("invalid constructor name in named object literal.");

        const ctor = type.constructors[ctorIdx];
        const fields = ctor.fields;
        const fNames = fields.map( f => f.name );

        if(
            fields.length !== this.fieldNames.length
            || this.fieldNames.length !== this.values.length
        ) throw new Error("incorrect number of fields in object literal");

        const len = fNames.length;
        const _namedFields: NamedExpr[] = new Array( len );
        for( let i = 0; i < len; i++ ) {
            _namedFields[i] = {
                name: fNames[i],
                expr: this.values[i]
            };
        }

        // sort according to definition order
        const namedFields = fNames.map( f => _namedFields.find( n => n.name === f )! );
        if( namedFields.some( thing => !isObject( thing ) ) ) {
            throw new Error("missing field in object literal");
        }
        
        if( type instanceof TirSoPStructType ) {
            return new IRConstr(
                0,
                namedFields.map(({ expr }) => expr.toIR( ctx ) )
            );
        }

        // else data
        const exprsAsData = namedFields.map(({ expr }) => {
            const exprType = getUnaliased( expr.type ) ?? expr.type;
            if(
                exprType instanceof TirSoPStructType
                || exprType instanceof TirSopOptT
                || exprType instanceof TirFuncT
                || exprType instanceof TirPairDataT
                // we have no way to describe it to typescript if not this way
                || exprType instanceof TirAliasType
                || exprType instanceof TirTypeParam
            ) throw new Error("filed cannot be encoded as data");

            /*
            const returnType = (
                exprType instanceof TirVoidT
                || exprType instanceof TirBoolT
                || exprType instanceof TirIntT
                || exprType instanceof TirBytesT
                || exprType instanceof TirStringT
                || exprType instanceof TirDataT
                || exprType instanceof TirListT
                || exprType instanceof TirLinearMapT
                || exprType instanceof TirUnConstrDataResultT
            ) ? data_t : exprType;
            //*/

            return new TirToDataExpr(
                expr,
                data_t,
                expr.range
            );
        });

        const fieldsAsListOfData = new TirLitArrExpr( exprsAsData, new TirListT( data_t ), this.range );

        return ( type.untagged ?
            new TirCallExpr(
                TirNativeFuncExpr.listData,
                [ fieldsAsListOfData],
                data_t,
                this.range
            ).toIR( ctx ) :
            new TirCallExpr(
                TirNativeFuncExpr.constrData,
                [
                    new TirLitIntExpr( BigInt(ctorIdx), this.range ),
                    fieldsAsListOfData
                ],
                data_t,
                this.range
            ).toIR( ctx )
        );
    }
}