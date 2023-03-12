
export class Ptr<T>
{
    ref!: T;

    constructor( stuff: T, typeCheck?: ( newVal: any ) => boolean )
    {
        let v = stuff;
        const tCheck = 
            typeof typeCheck === "function" ? 
                typeCheck : 
                (v:any) => true;

        Object.defineProperty(
            this, "ref",
            {
                get: () => v,
                set: (newVal: any) => {
                    if( tCheck( newVal ) )
                    {
                        v = newVal
                    }
                },
                enumerable: false, // don't show in for...of
                configurable: false
            }
        )
    }
}