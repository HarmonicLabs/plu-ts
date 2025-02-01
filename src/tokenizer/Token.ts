
/** Named token types. */
export enum Token {

    // keywords
    // discarded: ANY, NEVER, STRING, SYMBOL, LESSTHAN_SLASH, NULL
  
    Abstract,
    As,
    Async,
    Await,        // ES2017
    Boolean,      // ES2017
    Break,        // ES2017
    // Case,         // ES2017
    Catch,        // ES2017
    // Class,        // ES2017
    Struct,
    Const,        // ES2017
    Continue,     // ES2017
    // Constructor,
    Debugger,     // ES2017
    // Declare,
    // Default,      // ES2017
    // Delete,       // ES2017
    Do,           // ES2017
    Else,         // ES2017
    Enum,         // ES2017 future
    Export,       // ES2017
    Extends,      // ES2017
    False,        // ES
    Finally,      // ES2017
    For,          // ES2017
    From,         // AS possible identifier
    Function,     // ES2017
    Get,
    If,           // ES2017
    Implements,   // ES2017 non-lexical
    Import,       // ES2017
    In,           // ES2017
    InstanceOf,   // ES2017
    Interface,    // ES2017 non-lexical
    Is,
    KeyOf,
    Let,          // ES2017 non-lexical
    // Module,       // AS possible identifier
    Namespace,    // AS possible identifier
    // New,          // ES2017
    // Null,         // ES
    Number,
    Of,
    Override,
    Package,      // ES2017 non-lexical
    Private,      // ES2017 non-lexical
    Protected,    // ES2017 non-lexical
    Public,       // ES2017 non-lexical
    Readonly,
    Return,       // ES2017
    Set,
    Static,       // ES2017 non-lexical
    // Super,        // ES2017
    // Switch,       // ES2017
    This,         // ES2017
    // Throw,        // ES2017
    True,         // ES
    Try,          // ES2017
    Type,         // AS possible identifier
    // TypeOf,       // ES2017
    Undefined,    // ES
    Var,          // ES2017
    Void,         // ES2017
    While,        // ES2017
    With,         // ES2017
    Yield,        // ES2017

    // extra keywords for plu-ts
    // https://github.com/tc39/proposal-pattern-matching
    Match,          // match( thing ): ReturnType { ... }
    When,           // when Constr{ ... } => { ... }
    Fail,
    Assert,
  
    // punctuation
    
    /** `{` */
    OpenBrace,                              // {
    /** `}` */
    CloseBrace,                             // }
    OpenParen,                              // (
    CloseParen,                             // )
    /** `[` */
    OpenBracket,                            // [
    /** `]` */
    CloseBracket,                           // ]
    Dot,                                    // .
    Dot_Dot_Dot,                            // ...
    Semicolon,                              // ;
    Comma,                                  // ,
    LessThan,                               // <
    GreaterThan,                            // >
    LessThan_Equals,                        // <=
    GreaterThan_Equals,                     // >=
    Equals_Equals,                          // ==
    Exclamation_Equals,                     // !=
    Equals_Equals_Equals,                   // ===
    Exclamation_Equals_Equals,              // !==
    Equals_GreaterThan,                     // =>
    Plus,                                   // +
    Minus,                                  // -
    Asterisk_Asterisk,                      // **
    Asterisk,                               // *
    Slash,                                  // /
    Percent,                                // %
    Plus_Plus,                              // ++
    Minus_Minus,                            // --
    LessThan_LessThan,                      // <<
    GreaterThan_GreaterThan,                // >>
    GreaterThan_GreaterThan_GreaterThan,    // >>>
    Ampersand,                              // &
    Bar,                                    // |
    Caret,                                  // ^
    Exclamation,                            // !
    Tilde,                                  // ~
    Ampersand_Ampersand,                    // &&
    Bar_Bar,                                // ||
    Question,                               // ?
    /** `:` */
    Colon,                                  // :
    Equals,                                 // =
    Plus_Equals,                            // +=
    Minus_Equals,                           // -=
    Asterisk_Equals,                        // *=
    Asterisk_Asterisk_Equals,               // **=
    Slash_Equals,                           // /=
    Percent_Equals,                         // %=
    LessThan_LessThan_Equals,               // <<=
    GreaterThan_GreaterThan_Equals,         // >>=
    GreaterThan_GreaterThan_GreaterThan_Equals, // >>>=
    Ampersand_Equals,                       // &=
    Bar_Equals,                             // |=
    Caret_Equals,                           // ^=
    At,                                     // @

  
    // literals
  
    Identifier,
    StringLiteral,
    HexBytesLiteral,
    IntegerLiteral,
    // FloatLiteral,
    TemplateLiteral,
  
    // meta
  
    Invalid,
    EndOfFile
}

Object.freeze(Token);