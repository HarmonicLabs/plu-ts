
export enum MajorType {
    unsigned = 0,   // 000x_xxxx // 
    negative = 1,   // 001x_xxxx // 
    bytes    = 2,   // 010x_xxxx // 
    text     = 3,   // 011x_xxxx // 
    array    = 4,   // 100x_xxxx // 
    map      = 5,   // 101x_xxxx // 
    tag      = 6,   // 110x_xxxx // 
    float_or_simple    = 7    // 111x_xxxx // 
}

export enum MajorTypeAsUint8 {
    unsigned = 0b000_00000, 
    negative = 0b001_00000, 
    bytes    = 0b010_00000, 
    text     = 0b011_00000, 
    array    = 0b100_00000, 
    map      = 0b101_00000, 
    tag      = 0b110_00000, 
    float_or_simple    = 0b111_00000
}

export type AdditionalInformation = number
/*
    Bytes_addInfos  |
    Text_addInfos   |
    Arr_addInfos    |
    Map_addInfos    |
    Major7_addInfos
;
*/

export enum Unsigned_addInfos {
    expect_uint8    = 24 | 0, // 1 byte
    expect_uint16   = 25 | 0, // 2 bytes
    expect_uint32   = 26 | 0, // 4 bytes
    expect_uint64   = 27 | 0, // 8 bytes
    unknown         = 31 | 0  // 1f // from 28 to 31
}

export enum Negative_addInfos {
    expect_uint8    = 24 | 0, // 1 byte
    expect_uint16   = 25 | 0, // 2 bytes
    expect_uint32   = 26 | 0, // 4 bytes
    expect_uint64   = 27 | 0, // 8 bytes
    unknown         = 31 | 0  // 1f // from 28 to 31
}

export enum Bytes_addInfos {
    max_inByte_len         = 23 | 0, // 0 bytes
    expect_uint8_length    = 24 | 0, // 1 byte
    expect_uint16_length   = 25 | 0, // 2 bytes
    expect_uint32_length   = 26 | 0, // 4 bytes
    expect_uint64_length   = 27 | 0, // 8 bytes
    make_infinite = 0b000_11111, // 31
}

export enum Text_addInfos {
    max_inByte_len         = 23 | 0, // 0 bytes
    expect_uint8_length    = 24 | 0, // 1 byte
    expect_uint16_length   = 25 | 0, // 2 bytes
    expect_uint32_length   = 26 | 0, // 4 bytes
    expect_uint64_length   = 27 | 0, // 8 bytes
    make_infinite = 0b000_11111, // 31
}

export enum Arr_addInfos {
    max_inByte_len         = 23 | 0, // 0 bytes
    expect_uint8_length    = 24 | 0, // 1 byte
    expect_uint16_length   = 25 | 0, // 2 bytes
    expect_uint32_length   = 26 | 0, // 4 bytes
    expect_uint64_length   = 27 | 0, // 8 bytes
    make_infinite = 0b000_11111, // 31
}

export enum Map_addInfos {
    max_inByte_len         = 23 | 0, // 0 bytes
    expect_uint8_length    = 24 | 0, // 1 byte
    expect_uint16_length   = 25 | 0, // 2 bytes
    expect_uint32_length   = 26 | 0, // 4 bytes
    expect_uint64_length   = 27 | 0, // 8 bytes
    make_infinite = 0b000_11111, // 31
}

export enum Tag_addInfos {
    utf8_string         = 0  | 0,
    epoch_datetime      = 1  | 0,
    positive_bignum     = 2  | 0,
    negative_bignum     = 3  | 0,
    decimal_frac_array  = 4  | 0,
    bigfloat            = 5  | 0,
    first_unassigned    = 20 | 0, // 6 to 20
    expect_base64_url   = 21 | 0,
    expect_base64       = 22 | 0,
    expect_base16       = 23 | 0,
    sub_cbor            = 24 | 0,
    second_unassigned   = 31 | 0, // 25 to 31
    uri                 = 32 | 0,
    base64_url          = 33 | 0,
    base64              = 34 | 0,
    regexp              = 35 | 0,
    MIME                = 36 | 0, // https://datatracker.ietf.org/doc/html/rfc2045
    self_cbor           = 55799 | 0
}

// logic or (x | 0) ensure x to be an uint32
export enum Major7_addInfos {
    simple_unassigned   = 19 | 0, // form 0 to 19
    false               = 20 | 0,
    true                = 21 | 0,
    null                = 22 | 0,
    undefined           = 23 | 0,
    expect_byte_simple  = 24 | 0,
    float_half          = 25 | 0,
    float_single        = 26 | 0,
    float_double        = 27 | 0,
    unassigned          = 30 | 0,
    infinite_breack     = 31 | 0
}


const commonEnum = Object.freeze({
    max_inByte_len         : 23 | 0, // 0 bytes
    expect_uint8_length    : 24 | 0, // 1 byte
    expect_uint16_length   : 25 | 0, // 2 bytes
    expect_uint32_length   : 26 | 0, // 4 bytes
    expect_uint64_length   : 27 | 0, // 8 bytes
    make_infinite          : 0b000_11111
})

/**
 * @static
 */
class AddInfos
{
    constructor() {}

    static Unsigned : Readonly<{
        expect_uint8   : Unsigned_addInfos;
        expect_uint16  : Unsigned_addInfos;
        expect_uint32  : Unsigned_addInfos;
        expect_uint64  : Unsigned_addInfos;
        unknown        : Unsigned_addInfos;
    }> = Object.freeze({
        expect_uint8   : 24 | 0, // 1 byte
        expect_uint16  : 25 | 0, // 2 bytes
        expect_uint32  : 26 | 0, // 4 bytes
        expect_uint64  : 27 | 0, // 8 bytes
        unknown        : 31 | 0  // 1f // from 28 to 31
    })

    static Negative : Readonly<{
        expect_uint8   : Unsigned_addInfos;
        expect_uint16  : Unsigned_addInfos;
        expect_uint32  : Unsigned_addInfos;
        expect_uint64  : Unsigned_addInfos;
        unknown        : Unsigned_addInfos;
        utils: {
            BigInt: {
                min1: BigInt
            }
        };
    }> = Object.freeze({
        expect_uint8   : 24 | 0, // 1 byte
        expect_uint16  : 25 | 0, // 2 bytes
        expect_uint32  : 26 | 0, // 4 bytes
        expect_uint64  : 27 | 0, // 8 bytes
        unknown        : 31 | 0, // 1f // from 28 to 31
        utils: {
            BigInt: {
                min1: BigInt( -1 )
            }
        }
    })

    static Bytes : Readonly <{
        max_inByte_len         : Bytes_addInfos
        expect_uint8_length    : Bytes_addInfos
        expect_uint16_length   : Bytes_addInfos
        expect_uint32_length   : Bytes_addInfos
        expect_uint64_length   : Bytes_addInfos
        make_infinite          : Bytes_addInfos
    }> = commonEnum;

    static Text : Readonly <{
        max_inByte_len         : Text_addInfos
        expect_uint8_length    : Text_addInfos
        expect_uint16_length   : Text_addInfos
        expect_uint32_length   : Text_addInfos
        expect_uint64_length   : Text_addInfos
        make_infinite          : Text_addInfos
    }> = commonEnum;

    static Array : Readonly <{
        max_inByte_len         : Arr_addInfos
        expect_uint8_length    : Arr_addInfos
        expect_uint16_length   : Arr_addInfos
        expect_uint32_length   : Arr_addInfos
        expect_uint64_length   : Arr_addInfos
        make_infinite          : Arr_addInfos
    }> = commonEnum;

    static Map: Readonly <{
        max_inByte_len         : Map_addInfos
        expect_uint8_length    : Map_addInfos
        expect_uint16_length   : Map_addInfos
        expect_uint32_length   : Map_addInfos
        expect_uint64_length   : Map_addInfos
        make_infinite          : Map_addInfos
    }> = commonEnum;


    static Tag: Readonly<{
        utf8_string         : number,
        epoch_datetime      : number,
        positive_bignum     : number,
        negative_bignum     : number,
        decimal_frac_array  : number,
        bigfloat            : number,
        first_unassigned    : number,
        expect_base64_url   : number,
        expect_base64       : number,
        expect_base16       : number,
        sub_cbor            : number,
        second_unassigned   : number,
        uri                 : number,
        base64_url          : number,
        base64              : number,
        regexp              : number,
        MIME                : number, // https://datatracker.ietf.org/doc/html/rfc2045
        self_cbor           : number
    }> = {
        utf8_string         : 0  | 0,
        epoch_datetime      : 1  | 0,
        positive_bignum     : 2  | 0,
        negative_bignum     : 3  | 0,
        decimal_frac_array  : 4  | 0,
        bigfloat            : 5  | 0,
        first_unassigned    : 20 | 0, // 6 to 20
        expect_base64_url   : 21 | 0,
        expect_base64       : 22 | 0,
        expect_base16       : 23 | 0,
        sub_cbor            : 24 | 0,
        second_unassigned   : 31 | 0, // 25 to 31
        uri                 : 32 | 0,
        base64_url          : 33 | 0,
        base64              : 34 | 0,
        regexp              : 35 | 0,
        MIME                : 36 | 0, // https://datatracker.ietf.org/doc/html/rfc2045
        self_cbor           : 55799 | 0
    }

    static Major7: Readonly<{
        simple_unassigned   : Major7_addInfos, // form 0 to 19
        false               : Major7_addInfos,
        true                : Major7_addInfos,
        null                : Major7_addInfos,
        undefined           : Major7_addInfos,
        expect_byte_simple  : Major7_addInfos,
        float_half          : Major7_addInfos,
        float_single        : Major7_addInfos,
        float_double        : Major7_addInfos,
        unassigned          : Major7_addInfos,
        infinite_break      : Major7_addInfos
    }> = Object.freeze({
        simple_unassigned   : 19 | 0, // form 0 to 19
        false               : 20 | 0,
        true                : 21 | 0,
        null                : 22 | 0,
        undefined           : 23 | 0,
        expect_byte_simple  : 24 | 0,
        float_half          : 25 | 0,
        float_single        : 26 | 0,
        float_double        : 27 | 0,
        unassigned          : 30 | 0,
        infinite_break      : 31 | 0
    });
}

/**
 * @static
 */
export default
class CborConstants
{
    private constructor() {};

    static MajorTypeMask = 0b111_00000;

    static AdditionalInfosMask = 0b000_11111;

    static AddInfos = AddInfos;

    static MajorType : Readonly<{
        unsigned    : MajorType;
        negative    : MajorType;
        bytes       : MajorType;
        text        : MajorType;
        array       : MajorType;
        map         : MajorType;
        tag         : MajorType;
        float_or_simple       : MajorType;
    }> = Object.freeze({
        unsigned : 0,   // 000x_xxxx // 
        negative : 1,   // 001x_xxxx // 
        bytes    : 2,   // 010x_xxxx // 
        text     : 3,   // 011x_xxxx // 
        array    : 4,   // 100x_xxxx // 
        map      : 5,   // 101x_xxxx // 
        tag      : 6,   // 110x_xxxx // 
        float_or_simple    : 7    // 111x_xxxx // 
    });

    static MajorTypeAsUint8 : Readonly<{
        unsigned    : MajorTypeAsUint8;
        negative    : MajorTypeAsUint8;
        bytes       : MajorTypeAsUint8;
        text        : MajorTypeAsUint8;
        array       : MajorTypeAsUint8;
        map         : MajorTypeAsUint8;
        tag         : MajorTypeAsUint8;
        float_or_simple       : MajorTypeAsUint8;
    }> = Object.freeze({
        unsigned : 0b000_00000, 
        negative : 0b001_00000, 
        bytes    : 0b010_00000, 
        text     : 0b011_00000, 
        array    : 0b100_00000, 
        map      : 0b101_00000, 
        tag      : 0b110_00000, 
        float_or_simple    : 0b111_00000
    });

    static infinite_break = 0b111_11111 // 0xff // 255
}