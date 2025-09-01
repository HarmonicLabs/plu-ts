export function assert<T>( thing: T, message: string = "TypeAssertion failed" ): NonNullable<T>
{
    if ( !thing ) throw new Error( message );
    return thing;
}