import  { encodeBech32, byte, decodeBech32, isBech32, sha2_512, sha3, blake2b, sha2_256 } from "..";

function textToBytes( text: string ): byte[]
{
    return Array.from<byte>( Buffer.from( text , "utf8" ) as any );
}

function hexToBytes( hex: string ): byte[]
{
    return Array.from<byte>( Buffer.from( hex , "hex" ) as any );
}

function bytesToHex( bytes: byte[] ): string
{
    return Buffer.from( bytes ).toString("hex");
}

describe("src/crypto", () => {

    describe("encodeBech32", () => {

        test('encodeBech32("foo", textToBytes("foobar")) => "foo1vehk7cnpwgry9h96"', () => {
            
            expect(
                encodeBech32("foo", textToBytes("foobar") )
            ).toBe( "foo1vehk7cnpwgry9h96" );

        });

        test('encodeBech32("addr_test", hexToBytes("70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539")) => "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld"', () => {
            
            expect(
                encodeBech32("addr_test", hexToBytes("70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539"))
            ).toBe( "addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld" );

        });

    });

    describe("encodeBech32", () => {

        test('decodeBech32("addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld") => "[ "addr_test", hexToBytes("70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539") ]"', () => {
            
            expect(
                decodeBech32("addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld")
            ).toEqual([
                "addr_test",
                hexToBytes("70a9508f015cfbcffc3d88ac4c1c934b5b82d2bb281d464672f6c49539")
            ]);

        });

    });

    test("isBech32", () => {

        function _true( bech32: string ): void
        {
            expect( isBech32( bech32 ) ).toBe( true );
        }
        function _false( notBech32: string ): void
        {
            expect( isBech32( notBech32 ) ).toBe( false );
        }

        _true("foo1vehk7cnpwgry9h96");
        _false("foo1vehk7cnpwgry9h97");

        _true(encodeBech32("🔥🔥", textToBytes("some dummy stuff") ));
        // checksum will not match ( data part is valid for the "foo" human readable part)
        _false("🔥🔥1vehk7cnpwgry9h97");

        _true("a12uel5l");
        _true("abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw");
        _true("addr_test1wz54prcptnaullpa3zkyc8ynfddc954m9qw5v3nj7mzf2wggs2uld");

        _false("mm1crxm3i");
        _false("A1G7SGD8");
    });

    describe("sha2_256", () => {

        test('bytesToHex(sha2_256([0x61, 0x62, 0x63])) => "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"', () => {
            expect(
                bytesToHex( sha2_256([0x61, 0x62, 0x63]) )
            ).toEqual("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
        });

        test('sha2_256(textToBytes("Hello, World!")) => [223, 253, 96, 33, 187, 43, 213, 176, 175, 103, 98, 144, 128, 158, 195, 165, 49, 145, 221, 129, 199, 247, 10, 75, 40, 104, 138, 54, 33, 130, 152, 111]', () => {
            expect(
                sha2_256(textToBytes("Hello, World!"))
            ).toEqual( [223, 253, 96, 33, 187, 43, 213, 176, 175, 103, 98, 144, 128, 158, 195, 165, 49, 145, 221, 129, 199, 247, 10, 75, 40, 104, 138, 54, 33, 130, 152, 111] )
        });

    });

    describe("sha2_512", () => {

        test('bytesToHex( sha2_512( [0x61, 0x62, 0x63] ) ) => "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"', () => {
            expect(
                bytesToHex( sha2_512( [0x61, 0x62, 0x63] ) )
            ).toEqual("ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f")
        });

        test('bytesToHex( sha2_512([]) ) => "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"', () => {
            expect(
                bytesToHex( sha2_512([]) )
            ).toEqual("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e")
        });

    });

    describe("sha3", () => {

        test('bytesToHex(sha3(textToBytes("abc"))) => "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532"', () => {
            expect(
                bytesToHex( sha3( textToBytes("abc") ) )
            ).toEqual("3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532")
        });

        test('bytesToHex(sha3((new Array(135)).fill(2))) => "5bdf5d815d29a9d7161c66520efc17c2edd7898f2b99a029e8d2e4ff153407f4"', () => {
            expect(
                bytesToHex( sha3( (new Array(135)).fill(2) ) )
            ).toEqual("5bdf5d815d29a9d7161c66520efc17c2edd7898f2b99a029e8d2e4ff153407f4")
        });

        test('bytesToHex(sha3((new Array(134)).fill(3))) => "8e6575663dfb75a88f94a32c5b363c410278b65020734560d968aadd6896a621"', () => {
            expect(
                bytesToHex(sha3((new Array(134)).fill(3)))
            ).toEqual("8e6575663dfb75a88f94a32c5b363c410278b65020734560d968aadd6896a621")
        });

        test('bytesToHex(sha3((new Array(137)).fill(4))) => "f10b39c3e455006aa42120b9751faa0f35c821211c9d086beb28bf3c4134c6c6"', () => {
            expect(
                bytesToHex(sha3((new Array(137)).fill(4)))
            ).toEqual("f10b39c3e455006aa42120b9751faa0f35c821211c9d086beb28bf3c4134c6c6")
        });

        test('bytesToHex(sha3([]) => "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"', () => {
            expect(
                bytesToHex( sha3( [] ) )
            ).toEqual("a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a")
        });
        
    });

    describe("blake2b", () => {

        test('bytesToHex( blake2b([], 28) ) => 836cc68931c2e4e3e838602eca1902591d216837bafddfe6f0c8cb07', () => {
            expect(
                bytesToHex( blake2b([], 28) )
            ).toEqual("836cc68931c2e4e3e838602eca1902591d216837bafddfe6f0c8cb07")
        });

        test('bytesToHex(blake2b([0, 1])) => "01cf79da4945c370c68b265ef70641aaa65eaa8f5953e3900d97724c2c5aa095"', () => {

            expect(
                bytesToHex( blake2b([0, 1]) )
            ).toEqual("01cf79da4945c370c68b265ef70641aaa65eaa8f5953e3900d97724c2c5aa095");

        });

        test('bytesToHex(blake2b(textToBytes("abc"), 64)) => "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923"', () => {

            expect(
                bytesToHex( blake2b( textToBytes("abc"), 64 ) )
            ).toEqual("ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923");

        });

    })

});