# Plutus core specification paper walkthrough

Here you find the [Plutus core specification paper](https://hydra.iohk.io/build/5988492/download/1/plutus-core-specification.pdf)

## If you are on hurry

important parts for ```plu-ts``` implementation are:
- [Section 2 - Syntax](#section2)
- [Section 7 - Untyped Plutus Core](#section7)
- [Appendix D - ```flat``` serialization](#appendixD)


## Section 1 - Abstract

High level explanation of how Plutus core is meant to work

nothing practical but a great introduction give it a read if you are familiar with some computer sience specific terms

<a name="section2"></a>

## Section 2 - Syntax

introduction to conventions and builtin names used to write (_typed_) ```.plc``` programs

*Important to keep in mind for syntax*
```[ Term Term ]``` is an application
basically equivalent to a Beta-reduction step in pure lambda calulus

```[ Term Term Term ]``` being short for ```[ [Term Term] Term ]```
is just saying that Terms do work in a very similar way of haskell _partial function application_ 

**Section 2 - Figure 1** has been used to implement the base types you can find in the (from ```plu-ts``` root dir) ```/proof-of-concept/plutus-core-spec/index.ts``` file

>**_NOTE:_** ```Type``` and ```Kind``` are not implemented for two reaons
> 1. the library will focus on _Untyped_ plutus core and ```Type``` and ```Kind``` are used only in _Typed_ plutus core (see section 7.1 - Type erasure)
> 2. ```Type``` and ```Kind``` (```Kind``` in particular) make sense in a programming language that allows operations with types (such as Haskell), which is not the case of ```Typescript``` and surely not ```Javascript```

## Section 3 - Type correctness

Section 3 is about Context formalization

those are basically concepts known to every programmer in this world,
just in an abstract mathematical form

just like algebra,
you don't need to understand the underlying group theory to do sums and multiplications

the section is usefull for proving plutus core computability
but has little impact on actual implementation

## Section 4 - Reduction and execution

Section 4 is where beta-reduction is formalized

here is explained how plutus core is evaluated

### Section 4.1 
Section 4.1 is about "beta-reduction applied to types"

as specified before this makes more sense in a programming language that allows operations with types

examples of specifications translated to Haskel types:

pluts-core spec         | Haskell
------------------------|----------------------------------
(fun _ A)               | * -> A
(fun S _)               | S -> *
(all α K _)             | forall a. (... Haskell type ...)
(lam α K _)             | (\ _ -> _ ) -- lambda value
[_ A]                   | (Type) (A :: Type) -- application
[S _]                   | (S :: Type) (Type) -- application

### Section 4.2
Section 4.2 repeats the same on Values level

the last 3 lines are important

pluts-core spec         | Haskell
------------------------|----------------------------------
[_ M]                   | (Term) (M :: Term) -- application, with M being any valid Lambda Term
[V _]                   | (V :: Term) (Term) -- applicationm with V being an Applicable Term (aka, functions or lambdas)
(builtin {bn A∗} V∗_M∗) | same of above but specialized for builtins

### Section 4.3

Section 4.3 formalizes the CK machine,
which is the "program" run on the cardano nodes when executing Smart Contracts

<a name="section5"></a>

## Section 5 - Built in types, functions, and values

Section 5 is about formalizing builtin functions

this section is needed since before formalization nothing can be given as obvious

I could write something like the following and still be valid

```ts
function ifThenElse<ReturnTy = any>( condition: booelan, caseTrue: ReturnTy, caseFalse: ReturnTy): ReturnTy
{
    return caseTrue;
}
```

here is made clear that ```ifThenElse``` does something like this:

```ts
function ifThenElse<ReturnTy = any>( condition: booelan, caseTrue: ReturnTy, caseFalse: ReturnTy): ReturnTy
{
    return conditon ? caseTrue : caseFalse ;
}
```

all the other builtin functions here are self explanatory there's no need to go trough them

## Section 6

provide some expmles of ```.plc``` programs

may turn useful in test cases

<a name="section7"></a>

## Section 7 - Untyped Plutus Core

( [page 18 of the plutus core specification](https://hydra.iohk.io/build/5988492/download/1/plutus-core-specification.pdf#Untyped%20Plutus%20Core))

the Untyped version of Plutus Core programs is the one that goes on-chain
this is done in order to minimize the amount of informations on chain (ence minimize the size of the transaction)

untyped programs are not a problem if derived from typed ones ( think at Typescript transpiled to (untyped) Javascript )
the library will take care only of UPLC laveraging the Typescript type system

**Figure 15** specifies the grammar used in UPLC programs

in particoular specifies the ```Term``` datatype definition

in the paper a ```Term``` value is indicated either by _```L```_,_```M```_ or _```N```_

with that we know that a ```Term``` can be

- a _free_ variable
- a constant value
- a lambda abstraction with a _bounded_ variable and a ```Term``
- a lazy evaluated ```Term```
- an _Application_ between ```Term```s
    - <details>
        <summary>what Term Application means in Lamda calculus</summary>
        <p>
        if you come from an imperative programming language you can think at ```Term``` Applications as being simple function calls

        as an example say we have a lambda term like this, which computes a the ```f^2``` of any given ```f```
        ```
        λf. λx. f ( f x )
        ```
        which would be translated in ```haskell``` as
        ```
        \ f x -> f ( f x )
        ```
        and in ```typescript``` as
        ```ts
        ( f: (x: any) => any ) => { return ( x: any ) => f( f(x) ) }
        ```

        if we were to apply this ```Term``` in lambda calculus
        we would have to write something like
        ```
        (λf. λx. f ( f x ))( λx. x + 2 )
        ```
        and this has the effect of **substituting** any instance of the first bounded variable in the first ```Term``` with the second ```Term```
        thus resulting in
        ```
        (λx. ( x + 2 ) + 2 )
        ```
        and finally with an other ```Term``` Application such as
        ```
        (λx. ( x + 2 ) + 2 ) ( 5 )
        ```
        to get the final result **substituting** any ```x``` with the given value
        ```
        ( 5 + 2 ) + 2 -- = 7 + 2 = 9
        ```

        we se that in any intermediate passage the resut of a _```Term``` Application_ is once again a valid ```Term```
        </p>
      </details>
- a forced evaluation of a ```Term```
- a builtin Value (see [section 5](#section5))
- an error, failing the smart contract

from this definition is easy to see that ```Term``` is a _recursive_ datatype, in particoular, is the definition of the AST (Abstract Syntax Tree) of UPLC Programs

<a name="appendixD"></a>

## Appendix D - Serialization

moved to [Appendix D](./Appendix%20D.md)
