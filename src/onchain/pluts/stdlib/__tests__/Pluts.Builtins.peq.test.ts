import { peq, peqBs, peqData, peqInt, peqStr } from "../Builtins"
import PByteString from "../../PTypes/PByteString";
import PData from "../../PTypes/PData";
import PInt from "../../PTypes/PInt"
import PString from "../../PTypes/PString";
import PUnit from "../../PTypes/PUnit";


describe("peq", () => {

    it("returns the correct equality", () => {

        expect( peq( PInt ) ).toEqual( peqInt );
        expect( peq( PByteString ) ).toEqual( peqBs );
        expect( peq( PData ) ).toEqual( peqData );
        expect( peq( PString ) ).toEqual( peqStr );

    })

    it("throws on unsupported type", () => {

        expect( () => peq( PUnit as any ) ).toThrow();

    })
})