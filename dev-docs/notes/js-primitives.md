# javascript primitives

**_SOURCE_**: [MDN: Primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive#primitive_wrapper_objects_in_javascript)

In JavaScript, a primitive (primitive value, primitive data type) is data that is not an object and has no methods or properties

### All primitives are immutable

this means that the value itself never changes

this is not true for arrays and objects (which are not primitives)

this can be observed with constants; take the follwing example

```ts
const str = "hello world"

console.log(
    str.replace( "h", "w" ) // attempt to modify the string
); // prints out "wello world"

console.log( str ) // prints out "hello world"; the string has not changed
```

here the string never changed

if we try the same on an array we see that the value changes:
```ts
const strArr = Array.from( "hello world" );

console.log( strArr );
// (11) [ 'h','e','l','l','o',' ','w','o','r','l','d' ]

strArr.shift(); // 'h'
strArr.unshift( 'w' ); // 11

console.log( strArr );
// (11) [ 'w','e','l','l','o',' ','w','o','r','l','d' ]
```

here the array is the same but the value changed (mutated)