# `AstCompiler`

Type checking appens while compiling the AST to TIR.

this is litterally the only job of `AstCompiler`.

during compilation from AST to TIR no other magic happens, no desugaring, no optimizations, no nothing.

The resulting TIR, is essentially the same as the original AST,
with the only exception being that in the TIR universe there are:

- NO generic types, only concrete types
- NO generic functions
- NO overloaded functions (overloads are replaced with concrete functions with different signatures)

essentially the TIR, right after AST compilation, is the same as the original AST but with every type explicit, and any ambiguity removed.