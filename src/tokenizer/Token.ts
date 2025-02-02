
/** Named token types. */
export enum Token {

    // keywords
    // discarded: ANY, NEVER, STRING, SYMBOL, LESSTHAN_SLASH, NULL
  
    Abstract,
    As,
    Async,
    Await,        
    Boolean,      
    Break,        
    // Case,         
    Catch,        
    // Class,        
    Struct,
    Const,        
    Continue,     
    // Constructor,
    Debugger,     
    // Declare,
    // Default,      
    // Delete,       
    Do,           
    Else,         
    Enum,
    Export,       
    Extends,      
    False,        
    Finally,      
    For,          
    From,         // AS possible identifier
    Function,     
    Get,
    If,           
    Implements,
    Import,       
    In,           
    InstanceOf,   
    Interface,
    Is,
    KeyOf,
    Let,
    Namespace,
    // New,          
    // Null,         
    Number,
    Of,
    Override,
    Package,   
    Private,   
    Protected, 
    Public,    
    Readonly,
    Return,       
    Set,
    Static,    
    // Super,        
    // Switch,       
    This,         
    // Throw,        
    True,         
    Try,          
    Type,         // AS possible identifier
    // TypeOf,       
    Undefined,    
    Var,          
    Void,         
    While,        
    With,         
    Yield,        

    // extra keywords for pebble
    // https://github.com/tc39/proposal-pattern-matching
    Match,          // match( thing ) { ... }
    When,           // when Constr{ ... }: { ... }
    Test,           // test "name" { ... }

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
    /** `.` */
    Dot,                                    // .
    /** `...` */
    Dot_Dot_Dot,                            // ...
    /** `;` */
    Semicolon,                              // ;
    /** `,` */
    Comma,                                  // ,
    /** `<` */
    LessThan,                               // <
    /** `>` */
    GreaterThan,                            // >
    /** `<=` */
    LessThan_Equals,                        // <=
    /** `>=` */
    GreaterThan_Equals,                     // >=
    /** `==` */
    Equals_Equals,                          // ==
    /** `!=` */
    Exclamation_Equals,                     // !=
    /** `===` */
    Equals_Equals_Equals,                   // ===
    /** `!==` */
    Exclamation_Equals_Equals,              // !==
    /** `=>` */
    FatArrow,                               // =>
    /** `+` */
    Plus,                                   // +
    /** `-` */
    Minus,                                  // -
    /** `**` */
    Asterisk_Asterisk,                      // **
    /** `*` */
    Asterisk,                               // *
    /** `/` */
    Slash,                                  // /
    /** `%` */
    Percent,                                // %
    /** `++` */
    Plus_Plus,                              // ++
    /** `--` */
    Minus_Minus,                            // --
    /** `<<` */
    LessThan_LessThan,                      // <<
    /** `>>` */
    GreaterThan_GreaterThan,                // >>
    /** `>>>` */
    GreaterThan_GreaterThan_GreaterThan,    // >>>
    /** `+` */
    Ampersand,                              // &
    /** `|` */
    Bar,                                    // |
    /** `^` */
    Caret,                                  // ^
    /** `!` */
    Exclamation,                            // !
    /** `~` */
    Tilde,                                  // ~
    /** `&&` */
    Ampersand_Ampersand,                    // &&
    /** `||` */
    Bar_Bar,                                // ||
    /** `?` */
    Question,                               // ?
    /** `:` */
    Colon,                                  // :
    /** `=` */
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

    // custom native types for pebble

    Bytes,      // bytes
    Optional,   // Optional<T>
    List,       // List<T>
    LinearMap,  // LinearMap<K,V> 
  
    // literals
  
    Identifier,
    StringLiteral,
    HexBytesLiteral,
    IntegerLiteral,
    // FloatLiteral,
    StringTemplateLiteralQuote,
  
    // meta
  
    Invalid,
    EndOfFile
}

Object.freeze(Token);