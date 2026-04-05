// SQLQuest codex — ELI5 / Savvy / Man page for every SQL concept taught

export const sqlCodex = {
  'sql-select-star': {
    command: 'SELECT * FROM table',
    eli5: "You're at a restaurant and you say 'bring me everything.' SELECT * is the everything order — every column, every row, no filter. Great for exploring. Terrible for production because you might get 2 million rows.",
    savvy: '`SELECT *` retrieves all columns from a table. The `*` is a wildcard meaning "every column." Combine with `FROM table_name` to specify which table. Always scope with `WHERE` in real applications — unbounded selects on large tables are slow and expensive.',
    manpage: '`SELECT [columns | *] FROM table_name [WHERE condition] [ORDER BY col] [LIMIT n]` — Retrieve rows. `*` selects all columns. Specify columns by name to reduce data transfer. `SELECT 1` is a common connectivity test. Column expressions: `SELECT price * 1.1 AS price_with_tax`.',
  },

  'sql-select-columns': {
    command: 'SELECT col1, col2 FROM table',
    eli5: "Instead of ordering everything off the menu, you pick just what you need. Listing specific column names is called projection — you project only certain columns into your result, ignoring the rest.",
    savvy: 'Listing specific columns reduces data transferred from database to application (bandwidth), and makes query intent explicit. Column order in `SELECT` controls the output order, not the storage order. You can rename columns in the output with `AS`: `SELECT name AS artifact_name`.',
    manpage: '`SELECT col1, col2, ... FROM table` — Project specific columns. Column expressions allowed: `SELECT price * quantity AS total`. `SELECT DISTINCT col` removes duplicate values. Column aliases: `SELECT col AS alias`. Multiple tables: qualify with `table.column` or alias.',
  },

  'sql-where': {
    command: 'WHERE condition',
    eli5: "WHERE is the filter. Without it, you get everything. With it, you only get rows where your condition is true. It's like a bouncer at the door — only rows that pass the check get into your result.",
    savvy: '`WHERE` filters rows before any aggregation or sorting. Comparison operators: `=`, `!=`/`<>`, `>`, `<`, `>=`, `<=`. String comparisons are case-sensitive in most databases. `WHERE` runs before `GROUP BY`, `HAVING`, and `ORDER BY` in the logical execution order.',
    manpage: '`WHERE condition` — Filter rows. Operators: `=`, `!=`, `<>`, `>`, `<`, `>=`, `<=`. String: `LIKE`, `IN`, `BETWEEN`. Null: `IS NULL`, `IS NOT NULL`. Logical: `AND`, `OR`, `NOT`. `WHERE` applies to individual rows before grouping. Cannot use aggregate functions in `WHERE` — use `HAVING` instead.',
  },

  'sql-and-or': {
    command: 'AND / OR',
    eli5: "AND means both must be true. OR means at least one must be true. AND tightens the filter (fewer results). OR loosens it (more results). Parentheses control which parts are evaluated together — like math order of operations.",
    savvy: 'AND has higher precedence than OR — `WHERE a AND b OR c` evaluates as `WHERE (a AND b) OR c`. Always use parentheses to make complex logic explicit. Short-circuit evaluation: databases may skip evaluating the second condition if the first determines the result.',
    manpage: '`AND` — both conditions must be true. `OR` — at least one condition must be true. `NOT` — negates a condition. Precedence: `NOT` > `AND` > `OR`. Use parentheses to override: `WHERE a AND (b OR c)`. `NOT (a AND b)` is equivalent to `NOT a OR NOT b` (De Morgan\'s Law).',
  },

  'sql-not': {
    command: 'NOT / != / <>',
    eli5: "NOT flips a condition upside down. If something was true, it becomes false, and vice versa. It's useful when it's easier to describe what you DON'T want than what you do want.",
    savvy: '`NOT condition` negates any boolean expression. `NOT era = \'Modern\'` is equivalent to `era != \'Modern\'` or `era <> \'Modern\'`. Most useful with complex conditions: `NOT (era = \'Modern\' AND condition = \'pristine\')`. `NOT IN (list)` and `NOT LIKE \'pattern\'` are common patterns.',
    manpage: '`NOT condition` — Negate a predicate. Equivalences: `NOT (a = b)` = `a != b`. `NOT (a AND b)` = `NOT a OR NOT b`. `NOT IN (list)` excludes listed values. `NOT LIKE \'pattern\'` excludes pattern matches. `NOT BETWEEN a AND b` excludes the range (inclusive endpoints).',
  },

  'sql-like': {
    command: "LIKE 'pattern'",
    eli5: "LIKE is for fuzzy text matching. The % sign means 'anything goes here.' So 'Obsidian%' finds everything starting with Obsidian. '%idol%' finds anything with 'idol' anywhere inside it. Case-sensitivity depends on the database.",
    savvy: '`LIKE` uses two wildcards: `%` matches zero or more characters, `_` matches exactly one character. Case-sensitive in PostgreSQL, case-insensitive in MySQL by default. For case-insensitive searches: `ILIKE` (PostgreSQL), `LOWER(col) LIKE LOWER(pattern)`, or `COLLATE`. Performance: leading `%` prevents index use.',
    manpage: "`LIKE 'pattern'` — Pattern match. `%` — zero or more chars. `_` — exactly one char. `ILIKE` — case-insensitive (PostgreSQL). Escape: `LIKE '100\\%' ESCAPE '\\'` to match literal %. `NOT LIKE` negates. Patterns: `'A%'` starts with A, `'%Z'` ends with Z, `'%middle%'` contains middle, `'_at'` three-char ending in 'at'.",
  },

  'sql-between': {
    command: 'BETWEEN low AND high',
    eli5: "BETWEEN is shorthand for 'at least this, but no more than that.' Both endpoints are included. It works on numbers, dates, and text (alphabetical order). It's cleaner than writing two separate conditions.",
    savvy: '`BETWEEN a AND b` is exactly equivalent to `>= a AND <= b` — both endpoints are inclusive. Works with numeric, date, and string types. For dates: `BETWEEN \'2020-01-01\' AND \'2020-12-31\'`. String BETWEEN uses lexicographic order: `BETWEEN \'A\' AND \'M\'` matches names starting A through M.',
    manpage: '`expr BETWEEN low AND high` — Range filter (inclusive). Equivalent to `expr >= low AND expr <= high`. `NOT BETWEEN` excludes the range. Works with: integers, decimals, dates, timestamps, strings. Date example: `date_col BETWEEN \'2020-01-01\' AND \'2020-12-31\'`. String example: `name BETWEEN \'A\' AND \'Mz\'`.',
  },

  'sql-order-by': {
    command: 'ORDER BY col [ASC|DESC]',
    eli5: "ORDER BY sorts your results. Without it, the database returns rows in whatever order it feels like (which can change). ASC is A-to-Z, smallest-to-biggest (the default). DESC flips it. You can sort by multiple columns — first column wins, second breaks ties.",
    savvy: '`ORDER BY` runs after `WHERE`, `GROUP BY`, and `HAVING` — it sorts the final result set. `NULL` values sort first in ascending order in PostgreSQL, last in MySQL. Multiple columns: `ORDER BY era ASC, age DESC` groups by era first, then sorts by age within each group. Sorting is expensive on large unsorted tables — indexes help.',
    manpage: '`ORDER BY col [ASC|DESC], col2 [ASC|DESC]` — Sort result set. `ASC` default (omit or explicit). `DESC` reverses. `NULLS FIRST` / `NULLS LAST` controls NULL position (PostgreSQL). Can reference column aliases: `SELECT name AS n FROM t ORDER BY n`. `ORDER BY 1` sorts by first selected column (fragile — avoid).',
  },

  'sql-limit': {
    command: 'LIMIT n OFFSET m',
    eli5: "LIMIT says 'stop after this many rows.' OFFSET says 'skip this many rows first.' Together they're how pagination works: page 1 is LIMIT 10 OFFSET 0, page 2 is LIMIT 10 OFFSET 10, and so on.",
    savvy: '`LIMIT n` caps the result at n rows. `OFFSET m` skips the first m rows before applying LIMIT. Always pair with `ORDER BY` when paginating — without a stable sort, the same row can appear on multiple pages. MySQL/PostgreSQL use `LIMIT`; SQL Server uses `TOP n` or `OFFSET/FETCH`; Oracle uses `ROWNUM` or `FETCH FIRST`.',
    manpage: '`LIMIT n [OFFSET m]` — Restrict rows (MySQL, PostgreSQL, SQLite). `LIMIT 10 OFFSET 20` returns rows 21–30. SQL Server: `SELECT TOP 10`. Oracle: `WHERE ROWNUM <= 10`. Standard SQL: `FETCH FIRST 10 ROWS ONLY`. Pagination: page P of size N = `LIMIT N OFFSET (P-1)*N`. Always `ORDER BY` for consistent pagination.',
  },

  'sql-aliases': {
    command: 'table AS alias / col AS alias',
    eli5: "Aliases are nicknames. Instead of writing 'artifacts.name' everywhere, you call it 'a' and write 'a.name'. Shorter, faster to type, and mandatory when you join a table to itself. The AS keyword is optional in most databases.",
    savvy: 'Table aliases (`FROM artifacts AS a`) are required in self-joins and make multi-table queries readable. Column aliases (`SELECT COUNT(*) AS total`) rename output columns and can be referenced in `ORDER BY` but not in `WHERE` or `HAVING` (which evaluate before `SELECT`). `AS` is optional: `FROM artifacts a` works.',
    manpage: '`table_name [AS] alias` — Table alias. `expression [AS] alias` — Column alias. Scope: alias available in `SELECT`, `ORDER BY`. Not available in `WHERE`, `HAVING` (evaluated before SELECT). Required for: self-joins, disambiguating columns from multiple tables. `SELECT t.col FROM table AS t` — qualified column reference.',
  },

  'sql-count': {
    command: 'COUNT(*) / COUNT(column)',
    eli5: "COUNT(*) counts rows — all of them, even ones with empty values. COUNT(column) counts how many rows have a real value in that specific column (it skips NULLs). The difference matters when you have missing data.",
    savvy: '`COUNT(*)` counts all rows including those with NULLs. `COUNT(col)` counts non-NULL values in that column. `COUNT(DISTINCT col)` counts unique non-NULL values. Combined with `GROUP BY`, counts each group separately. Combined with `WHERE`, counts only matching rows (filter runs first).',
    manpage: '`COUNT(*) / COUNT(expr) / COUNT(DISTINCT expr)` — Count rows. `COUNT(*)` — all rows. `COUNT(col)` — non-NULL values. `COUNT(DISTINCT col)` — unique non-NULL values. Works with `GROUP BY` to count per group. `COUNT(*) FILTER (WHERE condition)` (PostgreSQL) — conditional count. Returns 0 (not NULL) when no rows match.',
  },

  'sql-aggregate': {
    command: 'AVG / MIN / MAX / SUM',
    eli5: "These functions collapse an entire column into a single number. AVG gives the average. MIN and MAX give the extremes. SUM adds everything up. They ignore NULL values. Combined with GROUP BY, they calculate separately for each group.",
    savvy: '`AVG`, `MIN`, `MAX`, `SUM` are aggregate functions — they compute a value across a set of rows. All ignore NULLs (except `COUNT(*)`). `AVG` returns the mean, not median (no built-in SQL median in most databases). Used with `GROUP BY` to compute per-group statistics. Can be used in `HAVING` to filter groups.',
    manpage: '`AVG(expr)` — arithmetic mean, ignores NULLs. `MIN(expr)` — smallest value, works on strings and dates. `MAX(expr)` — largest value. `SUM(expr)` — total of numeric column, ignores NULLs, returns NULL if all values are NULL. All support `DISTINCT`: `SUM(DISTINCT price)`. `FILTER (WHERE cond)` for conditional aggregation (PostgreSQL).',
  },

  'sql-group-by': {
    command: 'GROUP BY column',
    eli5: "GROUP BY sorts rows into buckets based on a column's value, then runs aggregate functions (COUNT, AVG, SUM) on each bucket separately. The output has one row per bucket. Every non-aggregated column in SELECT must be in GROUP BY.",
    savvy: '`GROUP BY` partitions the result set into groups sharing identical values in the specified columns. Execution order: `WHERE` filters rows → `GROUP BY` groups them → `HAVING` filters groups → `SELECT` produces output. Any column in `SELECT` that isn\'t inside an aggregate function must appear in `GROUP BY` (this is enforced by standard SQL).',
    manpage: '`GROUP BY col1 [, col2]` — Partition into groups. Multiple columns: `GROUP BY era, condition` creates one group per unique (era, condition) combination. `GROUP BY 1` groups by first SELECT column (fragile). `ROLLUP(a, b)` adds subtotals. `CUBE(a, b)` all combinations. `GROUPING SETS` explicit set of groupings.',
  },

  'sql-having': {
    command: 'HAVING condition',
    eli5: "HAVING is WHERE for groups. WHERE filters individual rows before grouping. HAVING filters groups after they've been counted/averaged/summed. You need HAVING when your condition involves an aggregate function like COUNT or AVG.",
    savvy: 'Execution order: `WHERE` (row filter) → `GROUP BY` (form groups) → `HAVING` (group filter) → `SELECT` (project columns) → `ORDER BY` (sort). `HAVING` can reference aggregate functions and `GROUP BY` columns. Cannot use column aliases defined in `SELECT` because `HAVING` evaluates before `SELECT` output is named.',
    manpage: '`HAVING condition` — Filter groups after aggregation. Used with `GROUP BY`. Can use aggregate functions: `HAVING COUNT(*) > 5`, `HAVING AVG(age) > 1000`, `HAVING MAX(value) < 10000`. Can combine: `HAVING COUNT(*) > 10 AND AVG(price) < 100`. `WHERE` runs before grouping; `HAVING` runs after.',
  },

  'sql-join': {
    command: 'JOIN table ON condition',
    eli5: "JOIN stitches two tables together on a shared piece of information — like matching puzzle pieces. The ON clause says which columns to match. Every row in the result combines data from both tables where the condition is true. Rows without a match are excluded (use LEFT JOIN to keep them).",
    savvy: '`JOIN` (or `INNER JOIN`) returns only rows where the `ON` condition matches in both tables. The `ON` clause typically compares a foreign key in one table to the primary key in another. Multiple JOINs chain left to right. Column name conflicts are resolved by qualifying with the table alias: `a.name`, `e.name`.',
    manpage: '`[INNER] JOIN table ON condition` — Combine matching rows. `ON a.id = b.a_id` typical FK-PK join. `NATURAL JOIN` auto-matches same-named columns (fragile). `JOIN ... USING (col)` when column names match. Multiple: `JOIN t1 ON ... JOIN t2 ON ...`. `CROSS JOIN` — cartesian product (every combination). Self-join: `FROM t a JOIN t b ON a.id = b.parent_id`.',
  },

  'sql-left-join': {
    command: 'LEFT JOIN',
    eli5: "LEFT JOIN keeps all rows from the left table, even if there's no match in the right table. Unmatched rows get NULL for all right-table columns. Use it when you need 'everyone, including those with nothing to show for it.'",
    savvy: '`LEFT JOIN` = `LEFT OUTER JOIN`. Returns all rows from the left table. Right table columns are NULL when no match exists. Use `COUNT(right.id)` (not `COUNT(*)`) to count matches — NULLs are excluded from `COUNT(col)` but not `COUNT(*)`. Combine with `WHERE right.id IS NULL` to find rows with no match (anti-join).',
    manpage: '`LEFT [OUTER] JOIN table ON condition` — All left rows, matched right rows. Unmatched: right columns = NULL. `RIGHT JOIN` — mirror image (rarely used; rewrite as LEFT JOIN). `FULL [OUTER] JOIN` — all rows from both, NULLs where no match. Anti-join: `LEFT JOIN ... WHERE right.id IS NULL` finds left rows with no match.',
  },

  'sql-null': {
    command: 'IS NULL / IS NOT NULL',
    eli5: "NULL means 'unknown' or 'missing' — not zero, not empty string, just... nothing. You can't check for it with = because NULL isn't equal to anything, not even itself. IS NULL and IS NOT NULL are the only correct ways to check for missing values.",
    savvy: 'NULL is not a value — it\'s the absence of a value. `NULL = NULL` is NULL (not true). `NULL != NULL` is also NULL. Only `IS NULL` and `IS NOT NULL` reliably detect NULLs. Aggregate functions ignore NULLs except `COUNT(*)`. `COALESCE(col, default)` substitutes a default when the value is NULL.',
    manpage: '`expr IS [NOT] NULL` — NULL check. `= NULL` always evaluates to NULL (not true/false). `COALESCE(a, b, c)` — first non-NULL value. `NULLIF(a, b)` — returns NULL if a = b, else a. `IS DISTINCT FROM` — NULL-safe comparison. In aggregate context: `COUNT(col)` skips NULLs, `COUNT(*)` includes them. `ORDER BY` places NULLs first (ASC) or last (DESC) — varies by database.',
  },

  'sql-insert': {
    command: 'INSERT INTO table (cols) VALUES (vals)',
    eli5: "INSERT adds a new row to a table. You list the columns you're filling in, then the values in the same order. Columns you don't list get their default value or NULL. It's like filling out a form — you don't have to answer every field.",
    savvy: '`INSERT INTO table (col1, col2) VALUES (val1, val2)` adds one row. Multi-row insert: `VALUES (v1, v2), (v3, v4)`. `INSERT INTO ... SELECT ...` inserts from a query. `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE` handle duplicates (PostgreSQL). Foreign key constraints are checked on insert.',
    manpage: '`INSERT INTO table [(columns)] VALUES (values)` — Add rows. Column list is optional (must match all columns in order if omitted). Multi-row: `VALUES (r1), (r2), (r3)`. From query: `INSERT INTO t SELECT * FROM s WHERE cond`. `RETURNING` clause (PostgreSQL): returns inserted row values. `ON CONFLICT` for upsert behavior.',
  },

  'sql-update': {
    command: 'UPDATE table SET col = val WHERE condition',
    eli5: "UPDATE modifies existing rows. SET says what to change. WHERE says which rows to change it in. Without WHERE, every single row in the table gets updated — a very common and painful mistake. Always test your WHERE clause with a SELECT first.",
    savvy: '`UPDATE table SET col = expr WHERE condition` modifies matching rows. Multiple columns: `SET col1 = v1, col2 = v2`. Can reference current values: `SET count = count + 1`. `UPDATE ... FROM ... WHERE` joins to another table (PostgreSQL). Always verify with `SELECT ... WHERE [same condition]` before running an UPDATE on production.',
    manpage: '`UPDATE table SET col = expr [, col2 = expr2] WHERE condition` — Modify rows. No `WHERE` = update all rows. `SET col = DEFAULT` reset to default. `UPDATE t SET col = s.val FROM source_table s WHERE t.id = s.id` — update from join. `RETURNING` returns modified rows (PostgreSQL). Row count returned indicates how many rows were affected.',
  },

  'sql-delete': {
    command: 'DELETE FROM table WHERE condition',
    eli5: "DELETE removes rows permanently. WHERE says which rows to delete. Without WHERE, the entire table is wiped — all rows gone, table structure stays. Always run a SELECT with the same WHERE first to see exactly what you're about to delete.",
    savvy: '`DELETE FROM table WHERE condition` removes matching rows. No `WHERE` = delete all rows (table structure preserved, unlike `DROP TABLE`). `TRUNCATE TABLE` is faster than `DELETE` for clearing an entire table (not logged row-by-row). Foreign key constraints may prevent deletion of referenced rows. Transactions allow rollback before committing.',
    manpage: '`DELETE FROM table [WHERE condition]` — Remove rows. No WHERE: delete all rows. `DELETE ... USING` / `DELETE ... FROM` join to another table for conditional delete. `TRUNCATE TABLE` — fast all-rows delete, non-transactional in some databases. `RETURNING` returns deleted rows (PostgreSQL). `ON DELETE CASCADE` on FK — automatically deletes child rows.',
  },

  'sql-distinct': {
    command: 'SELECT DISTINCT col',
    eli5: "DISTINCT removes duplicate rows from your results. If 2,847 rows all have an 'era' column with only 8 unique values, DISTINCT gives you just those 8 values — one per unique value. It works on one column or a combination of columns.",
    savvy: '`DISTINCT` applies to the entire row, not just one column. `SELECT DISTINCT era, condition` returns unique (era, condition) pairs. `COUNT(DISTINCT col)` counts unique non-NULL values. `DISTINCT` requires sorting internally and can be slow on large tables — an indexed column helps. `GROUP BY` without aggregates achieves the same result.',
    manpage: '`SELECT DISTINCT [col1, col2]` — Remove duplicate rows. Applies to all selected columns combined. `SELECT DISTINCT ON (col)` (PostgreSQL) — deduplicates keeping first row per distinct value (requires ORDER BY). `COUNT(DISTINCT expr)` — count unique non-NULL values. Alternative: `GROUP BY col` without aggregate achieves same as `DISTINCT`.',
  },

  'sql-subquery': {
    command: 'WHERE col IN (SELECT ...)',
    eli5: "A subquery is a query inside a query. The inner query runs first and produces a value or a list. The outer query uses that result as if you'd typed the answer yourself. Subqueries can replace JOINs for simple lookups.",
    savvy: 'Scalar subqueries return a single value (used in `WHERE col > (SELECT AVG(col)...)`). List subqueries return a column of values (used with `IN`, `NOT IN`, `ANY`, `ALL`). Correlated subqueries reference the outer query\'s row — run once per row (potentially slow). `EXISTS (subquery)` checks if subquery returns any rows.',
    manpage: '`WHERE col IN (SELECT col FROM t WHERE cond)` — List subquery. Scalar: `WHERE col > (SELECT AVG(col) FROM t)`. Correlated: `WHERE col = (SELECT MAX(x) FROM t WHERE t.id = outer.id)`. `EXISTS (subquery)` — true if subquery has rows. `NOT IN` / `NOT EXISTS` for exclusion. Subquery in FROM: `FROM (SELECT ...) AS alias`.',
  },

  'sql-case': {
    command: 'CASE WHEN condition THEN result END',
    eli5: "CASE WHEN is SQL's if-else. For each row, it checks conditions top to bottom and returns the first matching result. ELSE handles everything that doesn't match. Without ELSE, unmatched rows get NULL. It can appear anywhere a value can appear.",
    savvy: '`CASE WHEN cond THEN result ... ELSE default END` evaluates top-to-bottom, returns first match. Simple CASE: `CASE col WHEN val1 THEN r1 WHEN val2 THEN r2 END`. Can be used in `SELECT`, `ORDER BY`, `GROUP BY`, `WHERE`, `HAVING`. Useful for conditional aggregation: `SUM(CASE WHEN era = \'Bronze Age\' THEN 1 ELSE 0 END)`.',
    manpage: '`CASE WHEN cond THEN result [WHEN ...] [ELSE default] END` — Conditional expression. Simple form: `CASE expr WHEN val THEN result END`. Search form: `CASE WHEN expr THEN result END`. In aggregate: `COUNT(CASE WHEN active THEN 1 END)`. `IIF(cond, true_val, false_val)` (SQL Server). `IF(cond, t, f)` (MySQL). `COALESCE` preferred over `CASE` for NULL replacement.',
  },

  'sql-window': {
    command: 'func() OVER (PARTITION BY ... ORDER BY ...)',
    eli5: "Window functions are like GROUP BY but they don't collapse the rows. Each row keeps its identity AND gets a calculated value based on nearby rows. ROW_NUMBER() gives each row a rank within its group. You can see the whole picture and a zoomed-in view at the same time.",
    savvy: 'Window functions compute across a "window" of related rows without collapsing them. `OVER ()` — entire result set. `OVER (PARTITION BY col)` — per-group window. `OVER (ORDER BY col)` — running total or rank. Common functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`, `SUM() OVER`, `AVG() OVER`. Run after WHERE/GROUP BY/HAVING.',
    manpage: '`func() OVER ([PARTITION BY cols] [ORDER BY cols] [frame])` — Window function. Functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE(n)`, `LAG(col, offset)`, `LEAD(col, offset)`, `FIRST_VALUE()`, `LAST_VALUE()`. Frame: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Evaluated after WHERE, GROUP BY, HAVING — before ORDER BY.',
  },

  'sql-cte': {
    command: 'WITH name AS (SELECT ...)',
    eli5: "A CTE is a named temporary result you define at the top of your query. Instead of cramming a complex subquery in the middle of your SQL, you give it a name and reference it by that name. It makes queries readable — like naming a variable before using it.",
    savvy: '`WITH name AS (query) SELECT ... FROM name` creates a Common Table Expression. CTEs improve readability by breaking complex queries into named steps. Multiple CTEs: `WITH a AS (...), b AS (...) SELECT ...`. A CTE can reference previous CTEs. Recursive CTEs (`WITH RECURSIVE`) traverse tree structures. CTEs re-evaluate each time they\'re referenced (unless materialized).',
    manpage: '`WITH cte_name [(col_list)] AS (query) SELECT ...` — Common Table Expression. Multiple: `WITH a AS (...), b AS (...) SELECT ... FROM a JOIN b`. Recursive: `WITH RECURSIVE t AS (base_case UNION ALL recursive_case) SELECT FROM t`. CTEs can be used in `SELECT`, `INSERT`, `UPDATE`, `DELETE`. `MATERIALIZED` / `NOT MATERIALIZED` hints (PostgreSQL 12+) control evaluation strategy.',
  },

  'sql-view': {
    command: 'CREATE VIEW name AS SELECT ...',
    eli5: "A view is a saved query with a name. It looks and behaves like a table, but it holds no data — every time you query it, it re-runs the underlying SELECT. It's like creating a shortcut on your desktop. Great for hiding complexity and enforcing consistent logic.",
    savvy: '`CREATE VIEW name AS SELECT ...` saves a query definition (not data). Query the view like a table: `SELECT * FROM view_name`. Views re-execute the underlying query on each access. `CREATE OR REPLACE VIEW` updates a view. `DROP VIEW name` removes it. Materialized views (PostgreSQL) cache the result — must be refreshed manually. Views can restrict column access.',
    manpage: '`CREATE [OR REPLACE] VIEW name [(col_list)] AS query` — Create virtual table. `DROP VIEW name [CASCADE]` — remove. `ALTER VIEW` — modify properties. Updatable views: simple single-table views with no aggregates can accept INSERT/UPDATE/DELETE. `CREATE MATERIALIZED VIEW` — cached result set. `REFRESH MATERIALIZED VIEW` — update cache.',
  },
}
