# Changelog

## Unreleased 0.1.2

- [ ] `pfoldr` and `pfoldl` (`preduce`) for `TermList`
- [ ] `UtilityTermOf<PAlias<...>>` or `ToPType<AliasTermType<...>>` not working properly as `extract(...).in((...) => ...)` for PValue (alias of `list( pair( ... ) )`) returns `Term<PType>` expected is `TermList<PPair<...>>`
- [x] fixed some `TermList` typescript types

## v0.1.1

- [x] UtilityTerms should expose typescript functions rather than plu-ts ones; this was done to incentivize developers to reuse the terms but it extremly hurts readability
- [x] UtilityTerms will still expose the plu-ts term equivalent of each method trough the `<method name>Term` property