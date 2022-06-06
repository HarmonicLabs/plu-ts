# Appendix D - ```flat``` serialization

( [page 28 of the Plutus core specification paper](https://hydra.iohk.io/build/5988492/download/1/plutus-core-specification.pdf#Serialisation) )
( [```flat``` specification](http://quid2.org/docs/Flat.pdf) )

the first 3 lines are really usefull:

> We use the flat [Assini](http://quid2.org/docs/Flat.pdf) format to serialise Plutus Core terms. The flat format encodes sum
> types as tagged unions and products by concatenating their contents. We proceed by defining
> the structure and the data types of untyped Plutus Core and how they get serialised.

a basic underlying knowledge of what _"sum types"_ and _"products types"_ ( concatenation ) are meant to be is usefull here

here we are referencing to how [GHC.Generics] abstracts data structures, and in particoular ho the _type operators_ ```:+:``` and ```:*:``` are working

the [```GHC.Generics``` - Representing datatypes](https://hackage.haskell.org/package/base-4.16.1.0/docs/GHC-Generics.html#g:2) example does a great work at giving an idea

it explains how

```haskell
{-# LANGUAGE DeriveGeneric #-}

data Tree a = Leaf a | Node (Tree a) (Tree a)
  deriving Generic
```

is expanded to

```haskell
{- 
comments are added by me
no comments are present in the original example, 
nor in the expanded result of "deriving Generic"
-}

instance Generic (Tree a) where
  type Rep (Tree a) =
    D1 ('MetaData "Tree" "Main" "package-name" 'False)
      (C1 ('MetaCons "Leaf" 'PrefixI 'False) -- Leaf construcotr
         (S1 ('MetaSel 'Nothing
                         'NoSourceUnpackedness
                         'NoSourceStrictness
                         'DecidedLazy)
                (Rec0 a)) -- argument 1 o the Leaf constructor
       :+: -- :+: type level sum operator
       C1 ('MetaCons "Node" 'PrefixI 'False) -- Node constructor
         (S1 ('MetaSel 'Nothing
                         'NoSourceUnpackedness
                         'NoSourceStrictness
                         'DecidedLazy)
               (Rec0 (Tree a)) -- argument 1 o the Node constructor
          :*: -- :*: typelevel product operator
          S1 ('MetaSel 'Nothing
                         'NoSourceUnpackedness
                         'NoSourceStrictness
                         'DecidedLazy)
               (Rec0 (Tree a)))) -- argument 2 o the Node constructor
  ...
```

at compile time

from the example we see how in the definition

```haskell
data Tree a = Leaf a | Node (Tree a) (Tree a)
```
any ```|``` is an option between two constructors and becomes a ```:+:```(_sum of types_) in a ```Generic``` instance
and any argument of a given constructor is added by ```:*:```(_product of types_) operation

ith this in mind we now know that this ```Tree``` declaraion would be encoded in ```flat``` as a _tagged touple with the **arg** of the ```Leaf``` constructor at the first place and the **product of the args** of the ```Node``` constructor_

kind of:
```
a :+: Tree a :*: Tree a
```

## D.1 Varianble length data

**Varianble length data** is encoded as series of bytes in which the first bit can be considered as a ```boolean``` indicating if that is the last byte or not

```true``` or ```1``` means more bytes following
```false``` or ```0``` means this is the last

while parsing a variable length data an utility function could be:

```ts
function isLastByte( byte: number ): boolean
{
    /*
    to be more permissive we could keep only the last 8 bits, ignoring if it is greater (overflow):
    byte = byte & 0b1111_1111;
    */
    if( byte > 0b1111_1111 || byte < 0 )
    {
        throw Error("not a byte")
    }

    return !( byte & 0b1000_0000 );
    //     |        ^^^^^^^^^^^^^ mask that takes only the first bit
    //     ^ converts to boolean and returns ```true``` when the first bit is ```0```
}
```

## D.3 Untyped terms

> **_NOTE:_** I'm reporting D.3 section before D.2 since I think is more important to understand how the ```Term``` structure is serialized

**Figure 25** tells us how the multiple constructors of a ```Term``` are serialized

when we encounter a ```Term``` we are sure the first 4 bits will tell us how to interpret whatefer follows

respectively

tag         | meaning
------------|----------------------------------
 0 (Variable)    | name ( UTF8 string, variable length ?? or DeBruijin ? )
 1 (delay)       | term ( other 4 bits will tell what to do )
 2 (lambda)      | name( bounded var, UTF8 string, variable length ?? or DeBruijin ? ) && term ( other 4 bits will tell what to do  
 3 (application) | term (4 bit + payload ) ```:*:``` term (4 bit + payload 
 4 (constant)    | constant (see D.2 section ) (4 bit + payload ) 
 5 (force)       | term ( other 4 bits will tell what to do )
 6 (error)       | term ( other 4 bits will tell what to do )
 7 (builtin)     | ( uniquely identified by 5-bit tag )

## D.2 Constants

constant are encoded as a 4-bit tag explaining how to interpret the following bits:

tag         | meaning
------------|----------------------------------
 0 (Integer)     | ```ZigZag``` integer conversion and the Variable length
 1 (ByteString)  | Variable length
 2 (String)      | UTF8 string, variable length  
 3 (Char)        | UTF8 char, variable length 
 4 (unit)        | only tag, 0 bits following 
 5 (boolean)     | 1 bit; 0 == false , 1 == true

<details>
        <summary>What is ZigZag conversion </summary>
        <p>
            as explained in [Encoding - Protocol Buffers - Google Code](https://developers.google.com/protocol-buffers/docs/encoding?csw=1)
        </p>

        > ZigZag encoding maps signed integers to unsigned integers so that numbers with a small absolute value (for instance, -1) have a small varint encoded value too. It does this in a way that "zig-zags" back and forth through the positive and negative integers, so that -1 is encoded as 1, 1 is encoded as 2, -2 is encoded as 3, and so on, as you can see in the following table:
        >      Signed Original  Encoded As
        >      0                0
        >      -1               1
        >      1                2
        >      -2               3
        >      2147483647       4294967294
        >      -2147483648      4294967295
        > 
        >  In other words, each value n is encoded using
        > 
        >  `(n << 1) ^ (n >> 31)`
        > 
        >  for sint32s, or
        > 
        >  `(n << 1) ^ (n >> 63)`
        > 
        > for the 64-bit version.

</details>

 