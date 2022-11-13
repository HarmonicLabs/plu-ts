# Changelog

## Unreleased 0.1.2

- [ ] `pfoldr` and `pfoldl` (`preduce`) for `TermList`, and re-implementation of exsisting functions (`pfilter`,`pmap`,`pevery`,`psome`, etc...) in terms of the two new funcions (should result in smaller scripts)
    - [x] `pfoldr` and `pfoldl`
    - [ ] re-implementations
- [ ] `UtilityTermOf<PAlias<SomePType>>` should return `Term<PAlias<...>> & UtilityTermOf<SomePType>`
- [ ] `UtilityTermOf<PLam<...>>` should return `TermFn<...>`
- [ ] `ToPType<AliasTermType<...>>` not working properly as `extract(...).in((...) => ...)` for PValue (alias of `list( pair( ... ) )`) returns `Term<PType>` expected is `TermList<PPair<...>>`
- [x] fixed some `TermList` typescript types

## v0.1.1

- UtilityTerms should expose typescript functions rather than plu-ts ones; this was done to incentivize developers to reuse the terms but it extremly hurts readability
- UtilityTerms will still expose the plu-ts term equivalent of each method trough the `<method name>Term` property