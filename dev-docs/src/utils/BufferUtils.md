# BitUtils

**_SOURCE_**: [```src/utils/BufferUtils/index.ts```](../../../src/utils/BufferUtils/index.ts)

**exports default**: ```BufferUtils``` static class

## ```BufferUtils``` static class
---

### copy

```ts
static copy( buffer: Buffer ): Buffer
```

same as
```ts
Buffer.from( buffer );
```

### fromHex

```ts
static fromHex( hex:  string | HexString )
```

same as
```ts
Buffer.from( hex, "hex" )
```
but throws if the string is not a valid hex value

### randomBufferOfLength

```ts
static randomBufferOfLength( length: number, mustStartWith: number[] = [] ): Buffer
```

returns a Buffer of the given length with random bytes;

takes an optional array of numbers as second argument to use as first bytes;

the numbers inside the second argument are made non-negative, rounded and used in a module 256 operation in order to fit in a byte;

if the array has a length greather or equal than the first argument is immidiately converted to Buffer and returned