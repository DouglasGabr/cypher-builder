# 2.1.0 / 2021-10-09

- fix(patterns): don't add brackets to empty relationship patterns (`.relationship()`)
  - before: `-[]-`
  - after: `--`
- feat(clauses): add label predicates to where:

  ```typescript
  builder.where((w) => {
    w.andLabel('user', 'User').andLabel('admin', ['User', 'Admin']);
  });
  ```

  ```
  WHERE user:User AND admin:User:Admin
  ```

# 2.0.0 / 2021-10-07

- 💥 BREAKING CHANGE: `RelationshipDirection` is now just a string union, so previous usages as an enum must be updated
- chore: rename some `order by` types and export them in the index file

# 1.2.0 / 2021-10-07

- feat: add `delete` and `detachDelete` to builder

# 1.1.0 / 2021-10-06

- feat: add `orderBy` to builder
- chore: start inline documentation

# 1.0.0 / 2021-10-04

- Initial Release
