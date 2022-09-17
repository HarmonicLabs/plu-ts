import { VoidIfEmpty } from ".";

export type Params<Fn extends ((...args: any[]) => any) | ( new (...args: any[]) => any ) > = 
    Fn extends ( ...args: infer FnArgs ) => any ? VoidIfEmpty<FnArgs> :
    Fn extends new ( ...args: infer CtorFnArgs ) => any ? VoidIfEmpty<CtorFnArgs> :
    never;

export type ReturnT<Fn extends ((...args: any[]) => any) | ( new (...args: any[]) => any ) > = 
    Fn extends ( ...args: any[] ) => infer RetT ? RetT :
    Fn extends new ( ...args: any[] ) => infer CRetT ? CRetT :
    Fn extends { new( ...args: any[] ): infer CRetT } ? CRetT :
    never;
