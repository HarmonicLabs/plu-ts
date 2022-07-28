# BigIntUtils

**_SOURCE_**: [```src/utils/BigIntUtils/index.ts```](../../../src/utils/BigIntUtils/index.ts)

**exports default**: ```BigIntUtils``` static class

## ```BigIntUtils``` static class
---

contains a bunch of static methods useful when working with ```bigints```

### abs

```ts
static abs( n: bigint ): bigint
```
same as ```Math.abs``` but for bigints

### random

```ts
static random(): bigint
```
returns a random ```bigint``` in range ```[ 0 , Number.MAX_SAFE_INTEGER )```

### fromBufferLE

```ts
static fromBufferLE( buffer: Buffer ): bigint
```

uses the bytes of the buffer to construct a BigInteger
> **IMPORTANT**: the bytes are considered in Little Endian order; use ```BigIntUtils.fromBuffer``` for Big Endian

### fromBuffer

```ts
static fromBuffer( buffer: Buffer ): bigint
```
converts a Buffer to a ```bigint```

### toBuffer

```ts
static toBuffer( bigint: bigint, nBytes?: number ): Buffer
```

converts a ```bigint``` to a ```Buffer``` of length ```nBytes``` given as second argument

if ```nBytes``` is not specified the Buffer takes only the bytes needed

