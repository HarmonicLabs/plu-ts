
export enum AstNodeKind {

    Source,

    // types
    NamedType,
    FunctionType,
    TypeName,
    TypeParameter,
    Parameter,
    DestructuredParameter,
    TypeModifier, // `try` `?`

    // expressions
    Identifier,
    TypeAssertion,
    Binary,
    Call,
    Class,
    Comma,
    ElementAccess,
    False,
    Function,
    InstanceOf,
    Literal,
    New,
    // Null,
    Undefined,
    Omitted,
    Parenthesized,
    PropertyAccess,
    Ternary,
    // Super,
    This,
    True,
    Constructor,
    UnaryPostfix,
    UnaryPrefix,
    Compiled,

    // statements
    Assert,
    Block,
    Break,
    Continue,
    Do,
    Empty,
    Export,
    ExportDefault,
    ExportImport,
    Expression,
    For,
    ForOf,
    If,
    Import,
    Return,
    // Switch,
    Match,
    // SwitchCase,
    MatchWhenCase,
    // Throw,
    Fail,
    Try,
    Variable,
    Void,
    While,
    Module,

    // declaration statements
    ClassDeclaration,
    EnumDeclaration,
    EnumValueDeclaration,
    FieldDeclaration,
    FunctionDeclaration,
    ImportDeclaration,
    InterfaceDeclaration,
    MethodDeclaration,
    NamespaceDeclaration,
    TypeDeclaration,
    VariableDeclaration,

    // deconstruct statements
    ArrayDeconstructExpression,
    SingleConstrDeconstructExpression,
    NamedConstrDeconstructExpression,
    /** represents `{ field: { ... } }` deconstruction (different than `{ field }`) */
    FieldDeconstructExpression,

    // special
    // Decorator,
    ExportMember,
    
    IndexSignature,
    Comment
}

Object.freeze(AstNodeKind);