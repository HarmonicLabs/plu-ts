

export type UPLCBuiltinTagNumber
    = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 ;

export const enum UPLCBuiltinTag {
    AddInteger = 0,
    SubtractInteger = 1,
    MultiplyInteger = 2,
    DivideItneger = 3,
    RemainderInteger = 4,
    LessThanInteger = 5,
    LessThanEqInteger = 6,
    GreatherThanInteger = 7,
    GreatherThanEqInteger = 8,
    EqInteger = 9,
    Concatenate = 10,
    TakeByteString = 11,
    DropByteString = 12,
    SHA2 = 13,
    SHA3 = 14,
    VerifySignature = 15,
    EqByteString = 16,
    QuitientInteger = 17,
    ModInteger = 18,
    LtByteString = 19,
    GtByteString = 20,
    IfThenElse = 21,
    CharToString = 22,
    Append = 23,
    Trace = 24
}