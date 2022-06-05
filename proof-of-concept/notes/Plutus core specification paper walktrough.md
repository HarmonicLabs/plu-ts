# Plutus core specification paper walktrough

Here you find the [Plutus core specification paper](https://hydra.iohk.io/build/5988492/download/1/plutus-core-specification.pdf)

## If you are on hurry

important parts for ```plu-ts``` implementation are:
[Section 2 - Syntax]
[Section 7 - Untyped Plutus Core]
[Appendix D]


## Section 1 - Abstract

High level explanation of how Plutus core is meant to work

nothing practical but a great introduction give it a read if you are familiar with some computer sience specific terms

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

**the goal of  ```plu-ts``` is not to reimplement the whole protocol, only to make it more accessible**
therefore I'm reporting some intermpretations of mine for seek of completness,
but this section is not vital

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
which is the "program" runt on the cardano node when executing Smart-Contracts


as already said the goal of  ```plu-ts``` is not to reimplement the whole protocol.

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

## Section 7 - Untyped Plutus Core