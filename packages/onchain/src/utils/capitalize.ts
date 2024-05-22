export function capitalize<str extends string>( s: str ): Capitalize<str>
{
    if( s.length === 0 ) return s as any;
    return (s[0].toUpperCase() + s.slice( 1 )) as any;
}