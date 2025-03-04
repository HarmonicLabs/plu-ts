of course `Optional` here is not the best type for examples, because `Optional` will have first class support.

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
    