- `is` expression should parse only identifier, and optionally an object destructuring.
- add postfix question mark (error as optional) `?` (requires may require low level uplc manipulation)
 (NOTE: `?.` (optional chaining) is a different token)
- add `safe` keyword to use like
    ```ts
    safe function imGood( arr: List<int>, idx: int ): int
    {
        const result =
            // this function is marked as `safe`
            // but this operation may fail and throw an error
            // either `arr[i]?` or `arr.at(i)`, which yeild optional should be used
            // 
            // because this function is "safe", the compiler errors here
            arr[i];

        // safe operation
        trace result;

        return result;
    }
    ```
- add `untagged` keyword for list-encoded struct (error on multiple constrcutors)
    ```ts
    untagged struct MyThing {
        a: int,
        b: bytes
    }
    ```
- add `data` as struct and enum modifier, to indicate only data encoding (error on non data-representable fields) (compatible with `untagged` in the case of structs)
    ```ts
    data struct MyThing {
        a: int,
        b: bytes
    }
    untagged data struct MyOtherThing {
        a: int,
        b: bytes
    }
    data enum Ord {
        Lt = -1,
        Eq = 0,
        Gt = 1
    }
    ```
- add `runtime` keyword as struct and enum modifier, to indicate only SoP encoding (error on data operations)
    ```ts
    runtime struct MyThing {
        a: int,
        b: bytes
    }
    runtime enum Ord {
        Lt, // cannot assign custom values in case of runtime enum
        Eq,
        Gt
    }
    ```