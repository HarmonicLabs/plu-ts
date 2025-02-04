import { Machine } from "@harmoniclabs/plutus-machine";
import { PTxInInfo } from "../../../../API/V2/Tx/PTxInInfo"
import { data, int, str } from "../../../../../type_system"
import { pInt } from "../../int";
import { pStr } from "../../str";
import { pList, pnil } from "../const"

/*/
import * as fs from "fs";

import v8Profiler from 'v8-profiler-next';
v8Profiler.setGenerateType(1);
const title = 'list.const';

v8Profiler.startProfiling(title, true);
  afterAll(() => {
    const profile = v8Profiler.stopProfiling(title);
    profile.export(function (error, result: any) {
      // if it doesn't have the extension .cpuprofile then
      // chrome's profiler tool won't like it.
      // examine the profile:
      //   Navigate to chrome://inspect
      //   Click Open dedicated DevTools for Node
      //   Select the profiler tab
      //   Load your file
      fs.writeFileSync(`${title}.cpuprofile`, result);
      profile.delete();
    });
});
//*/

describe("pList", () => {

    test("pList( PTxInInfo.type )([])", () => {
        expect(
            Machine.evalSimple(
                pList( PTxInInfo.type )([])
                .toUPLC(0)
            )
        ).toEqual(
            Machine.evalSimple(
                pnil( data )
                .toUPLC(0)
            )
        )
    });

    test("pList( int )( [1,2,3].map( pInt ) )", () => {

        expect(
            () => pList( int )( [1,2,3].map( pInt ) ).toUPLC(0)
        ).not.toThrow()

    });

    test("pList( str )( [\"hello\",\"world\"].map( pStr ) )", () => {

        expect(
            () => pList( str )( ["hello","world"].map( pStr ) ).toUPLC(0)
        ).not.toThrow();
        
    });
    
})