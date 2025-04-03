import { BinaryExpr, ExponentiationExpr, LessThanExpr, GreaterThanExpr, LessThanEqualExpr, GreaterThanEqualExpr, EqualExpr, NotEqualExpr, AddExpr, SubExpr, MultExpr, DivExpr, ModuloExpr, ShiftLeftExpr, ShiftRightExpr, BitwiseAndExpr, BitwiseXorExpr, BitwiseOrExpr, LogicalAndExpr, LogicalOrExpr, OptionalDefaultExpr } from "../../../../ast/nodes/expr/binary/BinaryExpr";
import { TirBinaryExpr } from "../../../tir/expressions/binary/TirBinaryExpr";
import { TirType } from "../../../tir/types/TirType";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { _compileAddExpr } from "./binary/_compileAddExpr";
import { _compileBitwiseAndExpr } from "./binary/_compileBitwiseAndExpr";
import { _compileBitwiseOrExpr } from "./binary/_compileBitwiseOrExpr";
import { _compileBitwiseXorExpr } from "./binary/_compileBitwiseXorExpr";
import { _compileDivExpr } from "./binary/_compileDivExpr";
import { _compileEqualExpr } from "./binary/_compileEqualExpr";
import { _compileExponentiationExpr } from "./binary/_compileExponentiationExpr";
import { _compileGreaterThanEqualExpr } from "./binary/_compileGreaterThanEqualExpr";
import { _compileGreaterThanExpr } from "./binary/_compileGreaterThanExpr";
import { _compileLessThanEqualExpr } from "./binary/_compileLessThanEqualExpr";
import { _compileLessThanExpr } from "./binary/_compileLessThanExpr";
import { _compileLogicalAndExpr } from "./binary/_compileLogicalAndExpr";
import { _compileLogicalOrExpr } from "./binary/_compileLogicalOrExpr";
import { _compileModuloExpr } from "./binary/_compileModuloExpr";
import { _compileMultExpr } from "./binary/_compileMultExpr";
import { _compileNotEqualExpr } from "./binary/_compileNotEqualExpr";
import { _compileOptionalDefaultExpr } from "./binary/_compileOptionalDefaultExpr";
import { _compileShiftLeftExpr } from "./binary/_compileShiftLeftExpr";
import { _compileShiftRightExpr } from "./binary/_compileShiftRightExpr";
import { _compileSubExpr } from "./binary/_compileSubExpr";


export function _compileBinaryExpr(
    ctx: AstCompilationCtx,
    expr: BinaryExpr,
    typeHint: TirType | undefined
): TirBinaryExpr | undefined
{
    if( expr instanceof ExponentiationExpr ) return _compileExponentiationExpr( ctx, expr, typeHint );
    if( expr instanceof LessThanExpr ) return _compileLessThanExpr( ctx, expr, typeHint );
    if( expr instanceof GreaterThanExpr ) return _compileGreaterThanExpr( ctx, expr, typeHint );
    if( expr instanceof LessThanEqualExpr ) return _compileLessThanEqualExpr( ctx, expr, typeHint );
    if( expr instanceof GreaterThanEqualExpr ) return _compileGreaterThanEqualExpr( ctx, expr, typeHint );
    if( expr instanceof EqualExpr ) return _compileEqualExpr( ctx, expr, typeHint );
    if( expr instanceof NotEqualExpr ) return _compileNotEqualExpr( ctx, expr, typeHint );
    if( expr instanceof AddExpr ) return _compileAddExpr( ctx, expr, typeHint );
    if( expr instanceof SubExpr ) return _compileSubExpr( ctx, expr, typeHint );
    if( expr instanceof MultExpr ) return _compileMultExpr( ctx, expr, typeHint );
    if( expr instanceof DivExpr ) return _compileDivExpr( ctx, expr, typeHint );
    if( expr instanceof ModuloExpr ) return _compileModuloExpr( ctx, expr, typeHint );
    if( expr instanceof ShiftLeftExpr ) return _compileShiftLeftExpr( ctx, expr, typeHint );
    if( expr instanceof ShiftRightExpr ) return _compileShiftRightExpr( ctx, expr, typeHint );
    if( expr instanceof BitwiseAndExpr ) return _compileBitwiseAndExpr( ctx, expr, typeHint );
    if( expr instanceof BitwiseXorExpr ) return _compileBitwiseXorExpr( ctx, expr, typeHint );
    if( expr instanceof BitwiseOrExpr ) return _compileBitwiseOrExpr( ctx, expr, typeHint );
    if( expr instanceof LogicalAndExpr ) return _compileLogicalAndExpr( ctx, expr, typeHint );
    if( expr instanceof LogicalOrExpr ) return _compileLogicalOrExpr( ctx, expr, typeHint );
    if( expr instanceof OptionalDefaultExpr ) return _compileOptionalDefaultExpr( ctx, expr, typeHint );

    console.error( expr );
    throw new Error("unreachable::AstCompiler::_compileBinaryExpr");
}