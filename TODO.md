of course `Optional` here is not the best type for examples, because `Optional` will have first class support.

- match expressions (expr quivalent of match stmts)
```ts
let result = value ::
    Constructor1(x) => x * 2,
    Constructor2(y, z) => y + z,
    _ => 0;
```
double colon (`::`); cases separed by commas (`,`)

- add `using` to declare constructors in a scope
    ```ts
    function maybeSomething(): Optional<int>
    {
        using { Some, None } = Optional<int>;

        return Some{ value: 42 };
    }
    function doStuffWithSomething(): void
    {
        // NO
        // `using` only turns useful to construct new stuff
        // destructuring does not need it in scope,
        // because destructuring always has initialization expressions
        // from wich infer the type of the constructor
        // 
        // using { Some } = Optional<int>;

        const Some{ value: something } = maybeSomething();
    }
    ```
- add support for casting
    ```ts
    function maybeSomething(): Optional<int>
    {
        return Some{ value: 42 } as Optional<int>;
    }
    ```
