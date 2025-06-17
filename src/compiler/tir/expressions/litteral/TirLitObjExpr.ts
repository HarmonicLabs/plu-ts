import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";
import { TirDataStructType, TirSoPStructType } from "../../types/TirStructType";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { IRConstr, IRTerm } from "../../../../IR";
import { isObject } from "@harmoniclabs/obj-utils";
import { TirToDataExpr } from "../TirToDataExpr";
import { getUnaliased } from "../../types/utils/getUnaliased";
import { TirBoolT, TirBytesT, TirDataT, TirFuncT, TirIntT, TirLinearMapT, TirListT, TirPairDataT, TirSopOptT, TirStringT, TirUnConstrDataResultT, TirVoidT } from "../../types/TirNativeType";
import { data_t } from "../../program/stdScope/stdScope";
import { TirAliasType } from "../../types/TirAliasType";
import { TirTypeParam } from "../../types/TirTypeParam";
import { TirLitArrExpr } from "./TirLitArrExpr";
import { TirCallExpr } from "../TirCallExpr";
import { TirNativeFuncExpr } from "../TirNativeFuncExpr";
import { TirLitIntExpr } from "./TirLitIntExpr";
import { NamedExpr } from "../utils/NamedExpr";

export interface ITirLitObjExpr {
    fieldNames: Identifier[];
    values: TirExpr[];
}

export class TirLitObjExpr
    implements ITirExpr, ITirLitObjExpr
{
    constructor(
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

        if( type.constructors.length !== 1 )
        throw new Error("multiple constructors for unnamed object literal");

        const ctor = type.constructors[0];
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
                [
                    new TirLitArrExpr( exprsAsData, new TirListT( data_t ), this.range ),
                ],
                data_t,
                this.range
            ).toIR( ctx ) :
            new TirCallExpr(
                TirNativeFuncExpr.constrData,
                [
                    new TirLitIntExpr( BigInt(0), this.range ),
                    new TirLitArrExpr(
                        exprsAsData,
                        new TirListT( data_t ),
                        this.range
                    )
                ],
                data_t,
                this.range
            ).toIR( ctx )
        );
    }
}