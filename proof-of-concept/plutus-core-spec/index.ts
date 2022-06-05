/*
PLUTUS CORE SPECIFICATION PAPER: https://hydra.iohk.io/build/5988492/download/1/plutus-core-specification.pdf

// usefull for Untyped Plutus Core, which is a specialized version of untyped Lambda caluculus
Plutus core ```Term``` implementation: https://github.com/input-output-hk/plutus/blob/master/plutus-core/plutus-core/src/PlutusCore/Core/Type.hs#L79

// for serialization
// see also in this repository (from root) ```src/serialization/flat/nodes.md```
PlutusCore.Flat docs: https://playground.plutus.iohkdev.io/doc/haddock/plutus-core/html/PlutusCore-Flat.html
*/

import PlutusCoreName from "../base-values/PlutusCoreName"
import PlutusCoreInteger from "../base-values/PlutusCoreInteger";
import PlutusCoreByteString from "../base-values/PlutusCoreByeString";

import PlutusCoreUnit from "../base-values/PlutusCoreUnit";
import PlutusCoreBoolean from "../base-values/PlutusCoreBoolean";
import PlutusCoreVersion from "../base-values/PlutusCoreVersion";


type Name = PlutusCoreName;
type Var = Name;
/**
 * only used in **Typed** plutus core
 */
type TyVar = Name; 
type BuiltinName = Name;
type Integer = PlutusCoreInteger;
type ByteString = PlutusCoreByteString;
type Constant =
    | PlutusCoreUnit
    | PlutusCoreBoolean
    | Integer
    | ByteString;
type TypeConstant = Name;


// these below make more sense in a functional programming language
// please see section 2 of the plutus core specification

/*
 * ```Term``` is kind of an alias for ```Var```s
 * 
 * than is because all other possible ```Term```s instances are results of Lexiomes
 * which you can imagine as predefined functions that when evaluated (beta-reduced)
 * will result in a Variable (beta-normal form)
 */

/* ------------------------------- Defining Term constructors *untyped* ------------------------------- */

class Con
{
    private _tyName: TypeConstant;
    private _constantValue: Constant;
    constructor( ty: TypeConstant, constantValue: Constant )
    {
        this._tyName = ty;
        this._constantValue = constantValue;
    }
}

class Lam
{
    private _boundedVariable: Var;
    private _lambdaExpression: Term;
    constructor( boundedVar : Var, expr: Term )
    {
        this._boundedVariable = boundedVar;
        this._lambdaExpression = expr;
    }
}

class Delay
{
    private _tunk: () => Term;

    constructor( toTunk: Term )
    {
        this._tunk = () => { return toTunk };
    }

    public force() : Term
    {
        return this._tunk();
    }

}

/**
 * can be beta-reduced
 */
class TermApplication
{
    private _termA: Term;
    private _termB: Term;

    constructor( termA: Term, termB: Term )
    {
        this._termA = termA;
        this._termB = termB;
    }
}

class Force
{
    private _evaluatedExpr: Term;
    constructor( toForce: Term )
    {
        if( toForce instanceof Delay )
        {
            this._evaluatedExpr = toForce.force();
        }
        else
        {
            this._evaluatedExpr = toForce;
        }
    }
}

class Builtin
{
    private _builtin: BuiltinName;
    private _expr : Term;

    constructor( builtin: BuiltinName, appliedToExpr: Term )
    {
        this._builtin = builtin;
        this._expr = appliedToExpr;
    }
}

class UPLCError
{
    private _err: BuiltinName;
    constructor()
    {
        this._err = new PlutusCoreName("error")
    }
}
/** 
 * Proof of Concept implementation of the Untyped Plutus Core ```Term```
 * 
 * Typescript is not as expressive as Haskell when in comes to defining new datatypes
 * That is dued to the ability of Haskell to define mulitple constructors in one single data-type definition
 * 
 * a veri simila reslt in Typescript can be acheived as done in this case
 * 
 * first define the constructors as classes
 * 
 * then the type as a choiche between those constructors
 * 
 * for comparison here is the **Typed** Plutus core ```Term``` implementation in Haskell
 * source code at https://github.com/input-output-hk/plutus/blob/master/plutus-core/plutus-core/src/PlutusCore/Core/Type.hs#L79
 * 
 ```hs
 data Term tyname name uni fun ann
 = Var ann name -- ^ a named variable
 | TyAbs ann tyname (Kind ann) (Term tyname name uni fun ann)
 | LamAbs ann name (Type tyname uni ann) (Term tyname name uni fun ann)
 | Apply ann (Term tyname name uni fun ann) (Term tyname name uni fun ann)
 | Constant ann (Some (ValueOf uni)) -- ^ a constant term
 | Builtin ann fun
 | TyInst ann (Term tyname name uni fun ann) (Type tyname uni ann)
 | Unwrap ann (Term tyname name uni fun ann)
 | IWrap ann (Type tyname uni ann) (Type tyname uni ann) (Term tyname name uni fun ann)
 | Error ann (Type tyname uni ann)
 deriving stock (Show, Functor, Generic)
 deriving anyclass (NFData)
```
 */
type Term = 
      Var
    | Con
    | Lam
    | Delay
    | TermApplication
    | Force
    | Builtin
    | UPLCError;

class UPLCProgram
{
    private _version: PlutusCoreVersion;
    private _program: Term

    constructor( version: PlutusCoreVersion, program: Term )
    {
        this._version = version;
        this._program = program;
    }
}
