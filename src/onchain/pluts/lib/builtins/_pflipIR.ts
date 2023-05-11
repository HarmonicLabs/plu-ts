import { IRApp } from "../../../../../../src/onchain/IR/IRNodes/IRApp";
import { IRFunc } from "../../../../../../src/onchain/IR/IRNodes/IRFunc";
import { IRHoisted } from "../../../../../../src/onchain/IR/IRNodes/IRHoisted";
import { IRVar } from "../../../../../../src/onchain/IR/IRNodes/IRVar";

// identicall to `pflip` just at UPLC level to avoid using `papp`
export const _pflipIR = new IRHoisted(
    new IRFunc( 3, // toFlip, secondarg, fstArg
        new IRApp(
            new IRApp(
                new IRVar( 2 ),   // toFlip,
                new IRVar( 0 )    // firstArg
            ),
            new IRVar( 1 )        // secondArg
        )
    )
);