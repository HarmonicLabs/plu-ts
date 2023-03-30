import BigIntUtils from "../../../../utils/BigIntUtils";
import { BitStream } from "../../../../types/bits/BitStream";
import { ByteString } from "../../../../types/HexString/ByteString";
import { compile } from "../../../pluts/Script/compile";
import { UPLCDecoder } from "../../UPLCDecoder";
import { UPLCProgram } from "../../UPLCProgram";
import { UPLCVersion } from "../../UPLCProgram/UPLCVersion";
import { Application } from "../../UPLCTerms/Application";
import { Builtin } from "../../UPLCTerms/Builtin";
import { Force } from "../../UPLCTerms/Force";
import { UPLCConst } from "../../UPLCTerms/UPLCConst";
import { ptrace, ptraceIfFalse, pfn, pforce, pdelay, perror, pByteString, pStr, pmakeUnit, data, delayed, unit } from "../../../pluts";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils";


describe("serializeBuiltin", () => {

    describe("trace", () => {

        test.skip("simple trace", () => {

            const traceUnit = ptrace( unit )
                .$( pStr("hello there") )
                .$( pmakeUnit() );

            const compiled = compile( traceUnit );

            const manuallyCompiled = BitStream.fromBinStr([
                "00000001" + '0'.repeat(16), // version 1.0.0
                "00110011", // 2 applications
                "0101" + "0111" + "0011100", // force + builtin + trace tag (28)
                "0100", // UPLCConst
                "1" + "0010" + "0", // const type string
                "0000001", // pad 7
                (11).toString(2).padStart( 8, '0' ), // bytestring chunk of length 11 follows
                new BitStream( fromUtf8( "hello there" ) , 0 ).toBinStr().asString, // "hello there" in utf8 binary
                "00000000", // end bytestring
                "0100", // UPLCConst
                "1" + "0011" + "0", // const type unit
                "000001", // pad 6
            ].join(''));

            const deserializedTarget = new UPLCProgram(
                new UPLCVersion( 1, 0, 0 ),
                new Application(
                    new Application(
                        new Force(
                            Builtin.trace
                        ),
                        UPLCConst.str("hello there")
                    ),
                    UPLCConst.unit
                )
            )

            expect(
                "0000000" + BigIntUtils.fromBuffer( compiled ).toString(2)
            ).toEqual(
                manuallyCompiled
                .toBinStr().asString
            );

            expect(
                UPLCDecoder.parse(
                    compiled,
                    "flat"
                )
            ).toEqual(
                deserializedTarget
            );

        })

        test.skip("ptraceIfFalse.$(string).$(bytestring == input)", () => {

            const correctBS = ByteString.fromAscii( "Cardano <3 plu-ts" )
            const traceBS = ptraceIfFalse.$( pStr("wrong bytestring") )
            .$( pByteString( correctBS ).eq( pByteString( ByteString.fromAscii("") ) ) );

            const compiled = compile( traceBS );

            const deserilized = UPLCDecoder.parse(
                compiled,
                "flat"
            );

        })

        test.skip("failHelloThere contract", () => {

            const traceUnit = pfn([
                data,
                data,
                data
            ],  unit)
            (( _d, _r, _c ) => 
                pforce( 
                    ptrace( delayed( unit ) )
                    .$( pStr("hello there") )
                    .$( pdelay( perror( unit ) ) )
                )
            ) 

            const compiled = compile( traceUnit );

            /*
            console.log(
                JSON.stringify(
                    scriptToJsonFormat(
                        compiled,
                        PlutusScriptVersion.V1
                    )
                )
            );
            //*/
        });
        
    });

});