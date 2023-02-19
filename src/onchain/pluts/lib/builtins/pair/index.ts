import { Application } from "../../../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { Lambda } from "../../../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../../../UPLC/UPLCTerms/UPLCVar";
import { TermFn, PPair, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { PrimType, TermType, ToPType, lam, pair } from "../../../type_system";
import { unwrapAsData } from "../../../type_system/tyArgs";
import { pfromData_minimal } from "../../std/data/conversion/fromData_minimal";
import { addApplications } from "../addApplications";


export function pfstPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<A>>
{
    const a = fstType;
    const b = sndType;

    const outT = a[0] === PrimType.AsData ? unwrapAsData( a as any ) : a;

    return addApplications<[ PPair<ToPType<A>, ToPType<B>> ], ToPType<A>>(
        new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<A>>>(
            lam( pair( a, b ), outT ) as any,
            dbn => {
                if( a[0] === PrimType.AsData )
                return new Lambda(
                    new Application(
                        pfromData_minimal( outT ).toUPLC( dbn ),
                        new Application(
                            Builtin.fstPair,
                            new UPLCVar(0)
                        )
                    )
                );

                return Builtin.fstPair
            }
        )
    );
}

export function psndPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<B>>
{
    const a = fstType;
    const b = sndType;

    const outT = b[0] === PrimType.AsData ? unwrapAsData( b as any ) : b;

    return addApplications<[ PPair<ToPType<A>, ToPType<B>> ], ToPType<B>>(
        new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<B>>>(
            lam( pair( a, b ), outT ) as any,
            dbn => {
                if( b[0] === PrimType.AsData )
                return new Lambda(
                    new Application(
                        pfromData_minimal( outT ).toUPLC( dbn ),
                        new Application(
                            Builtin.sndPair,
                            new UPLCVar(0)
                        )
                    )
                );

                return Builtin.sndPair
            }
        )
    );
}