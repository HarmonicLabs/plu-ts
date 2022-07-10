
export default interface Pretty
{
    pretty: <ArgsTypes extends any[] = any[]>( ...args : ArgsTypes ) => string
}