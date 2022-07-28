# BitUtils

**_SOURCE_**: [```src/utils/BitUtils/index.ts```](../../../src/utils/BitUtils/index.ts)

**exports default**: ```BitUtils``` static class

## ```BitUtils``` static class
---

contains a bunch of static methods useful when working at lower level

### andMaskOfLength

```ts
static andMaskOfLength( n: bigint ): bigint
```

returns a ```bigint``` of that as the last ```n``` bits setted to ones;

example
```ts
BitUtils.getMaskOfLength( 7 ) === Bigint( 0b0111_1111 ); // true
```

### getNLastBits

```ts
static getNLastBits( fromNuber : bigint , nBits: bigint ) : bigint
```

gets the last bits of a given ```bigint```

### getNOfUsedBits

```ts
static getNOfUsedBits( bits: bigint ): number
```

returns the number of bits from the first setted to ```1``` on the left up until the end

### minBytesRequired

```ts
static minBytesRequired( bigint: bigint ): number
```

> **_IMPORTANT:_** works for positive ```bigint```s only