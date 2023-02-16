import { Application } from "../../../../../UPLC/UPLCTerms/Application"
import { HoistedUPLC } from "../../../../../UPLC/UPLCTerms/HoistedUPLC"
import { genHoistedSourceUID } from "../../../../../UPLC/UPLCTerms/HoistedUPLC/HoistedSourceUID/genHoistedSourceUID"
import { Lambda } from "../../../../../UPLC/UPLCTerms/Lambda"
import { UPLCVar } from "../../../../../UPLC/UPLCTerms/UPLCVar"
import { Term } from "../../../../Term"
import { TermType, fn, lam } from "../../../../type_system"


export function _papp( a: Term<any>, b: Term<any> )
{
    return new Term(
        a.type[2] as TermType,
        dbn => new Application(
            a.toUPLC(dbn),
            b.toUPLC(dbn)
        )
    )
}

const _pcomposeUID = genHoistedSourceUID();
export const _pcompose = ( a: TermType, b: TermType, c: TermType) =>
new Term(
    fn([
        lam( b, c ),
        lam( a, b ),
        a
    ],  c),
    _dbn => new HoistedUPLC(
        new Lambda(
            new Lambda(
                new Lambda(
                    new Application(
                        new UPLCVar(2),
                        new Application(
                            new UPLCVar(1),
                            new UPLCVar(0)
                        )
                    )
                )
            )
        ),
        _pcomposeUID
    )
)
