# bigint

**_SOURCE_**: [MDN: bigint](https://developer.mozilla.org/en-US/docs/Glossary/BigInt) (primitive)

**_SOURCE_**: [MDN: BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) (wrapper object; constructor and methods)

> **_NOTE_**: [safe primitives numebers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)

> **_NOTE_**: [```Number.MAX_SAFE_INTEGER```](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#bigint_type)

bigints are a [javascript primitive](./js-primitives.md) that natively supports arbitrary length integers.

in this repository are used to have a lower level access to bits, such as in the [BitStream class](../src/types/bits/BitStream.md), on top of their proper usage ( as in the [```Integer``` class](../src/types/ints/Integer.md) );

>It is worth noting that, even if ```bigints``` are primitives; tehe operations on them are done using software; on the contrary of ```number``` operations that do use directly the processor instructions, ence are hardware;
>
>this makes ```bigint```'s operations [99% slower](https://betterprogramming.pub/the-downsides-of-bigints-in-javascript-6350fd807d) than number's ones.

## Operations

### Comparisons

[MDN BigInt #Comparisons](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#comparisons)