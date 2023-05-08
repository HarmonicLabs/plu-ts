export function assert( condition: boolean, errorMessage: string | Error , addInfos?: any  ,...args: any[])
{
    if( condition ) return;
    
    args.length > 0 && console.error(...args);
    addInfos && console.error(addInfos);

    if( errorMessage instanceof Error )
    {
        throw errorMessage
    };

    throw new Error( errorMessage );
}