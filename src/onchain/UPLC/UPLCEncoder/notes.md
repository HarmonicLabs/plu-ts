# Flat Haskell library notes

## Flat.Instances.Base for Haskell types included in the ```base``` library

[Flat.Instances.Base on Github](https://github.com/Quid2/flat/blob/master/src/Flat/Instances/Base.hs#L148)
[Flat.Instances.Base on Hackage](https://hackage.haskell.org/package/flat-0.4.4/docs/Flat-Instances-Base.html)

## Flat.Encoder.Strict

```hs
-- definition in Flat.Endcoder.Strict
newtype Encoding =
  Encoding
    { run :: Prim
    }
    
-- where Prim is defined in Flat.Encoder.Types as

-- |Strict encoder state
data S =
       S
         { nextPtr  :: {-# UNPACK #-} !(Ptr Word8)
         , currByte :: {-# UNPACK #-} !Word8
         , usedBits :: {-# UNPACK #-} !NumBits
         } deriving Show

-- |A basic encoder
type Prim = S -> IO S

```