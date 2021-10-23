type ClausePrefix =
  | 'MATCH'
  | 'MERGE'
  | 'CREATE'
  | 'WHERE'
  | 'RETURN'
  | 'SKIP'
  | 'LIMIT'
  | 'WITH'
  | 'SET'
  | 'ON CREATE SET'
  | 'ON MATCH SET'
  | 'OPTIONAL MATCH'
  | 'ORDER BY'
  | 'DELETE'
  | 'DETACH DELETE'
  | 'UNION ALL'
  | 'UNION'
  | 'UNWIND'
  | 'USING INDEX'
  | 'USING INDEX SEEK'
  | 'USING SCAN'
  | 'USING JOIN ON'
  | 'USING PERIODIC COMMIT';

export abstract class Clause {
  constructor(protected prefix: ClausePrefix) {}
}
