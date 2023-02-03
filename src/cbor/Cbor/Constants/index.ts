
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

export function isMajorTypeTag( majorTag: MajorType ): boolean
{
    return(
        majorTag >= 0 && majorTag <= 7  &&
        majorTag === Math.round( majorTag )
    )
}

export enum UInt8MajorType {
    unsigned = 0b000_00000, 
    negative = 0b001_00000, 
    bytes    = 0b010_00000, 
    text     = 0b011_00000, 
    array    = 0b100_00000, 
    map      = 0b101_00000, 
    tag      = 0b110_00000, 
    float_or_simple    = 0b111_00000
}

export function isUInt8MajorType( byte : UInt8MajorType ): boolean
{
    return (
        (byte & 0b111_00000) === byte &&
        isMajorTypeTag( byte >> 5 )
    );
}

/**
 * @static
 */
class AddInfos
{
    constructor() {}

    static Length : Readonly<{
        expect_uint8   : 24
        expect_uint16  : 25
        expect_uint32  : 26
        expect_uint64  : 27
        make_infinite  : 31
    }> = Object.freeze({
        expect_uint8    : 24, // 1 byte
        expect_uint16   : 25, // 2 bytes
        expect_uint32   : 26, // 4 bytes
        expect_uint64   : 27, // 8 bytes
        make_infinite          : 0b000_11111
    })

    static Tag: Readonly<{
        utf8_string         : number,
        epoch_datetime      : number,
        positive_bignum     : number,
        negative_bignum     : number,
        decimal_frac_array  : number,
        bigfloat            : number,
        expect_base64_url   : number,
        expect_base64       : number,
        expect_base16       : number,
        sub_cbor            : number,
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
        expect_base64_url   : 21 | 0,
        expect_base64       : 22 | 0,
        expect_base16       : 23 | 0,
        sub_cbor            : 24 | 0,
        uri                 : 32 | 0,
        base64_url          : 33 | 0,
        base64              : 34 | 0,
        regexp              : 35 | 0,
        MIME                : 36 | 0, // https://datatracker.ietf.org/doc/html/rfc2045
        self_cbor           : 55799 | 0
    }

    static Major7: Readonly<{
        false               : 20,
        true                : 21,
        null                : 22,
        undefined           : 23,
        simple_byte         : 24,
        float_half          : 25,
        float_single        : 26,
        float_double        : 27,
        infinite_break      : 31
    }> = Object.freeze({
        false               : 20,
        true                : 21,
        null                : 22,
        undefined           : 23,
        simple_byte         : 24,
        float_half          : 25,
        float_single        : 26,
        float_double        : 27,
        infinite_break      : 31
    });
}

/**
 * @static
 */
export class CborConstants
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

    static UInt8MajorType : Readonly<{
        unsigned    : UInt8MajorType;
        negative    : UInt8MajorType;
        bytes       : UInt8MajorType;
        text        : UInt8MajorType;
        array       : UInt8MajorType;
        map         : UInt8MajorType;
        tag         : UInt8MajorType;
        float_or_simple       : UInt8MajorType;
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