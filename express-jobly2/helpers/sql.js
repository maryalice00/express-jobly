const { BadRequestError } = require("../expressError");

/**
 * Generates the SQL query for a partial update operation.
 *
 * @param {Object} dataToUpdate - An object containing the data to be updated.
 * @param {Object} jsToSql - An optional mapping of JavaScript column names to their corresponding SQL column names.
 * @throws {BadRequestError} - If no data is provided for the update.
 * @returns {Object} - An object containing the set clause and values for the SQL update query.
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

// Unit tests
describe("sqlForPartialUpdate", () => {
  test("Generates SQL for partial update", () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: 'first_name' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result.setCols).toBe('"first_name"=$1, "age"=$2');
    expect(result.values).toEqual(['Aliya', 32]);
  });

  test("Throws BadRequestError when no data is provided", () => {
    const dataToUpdate = {};
    const jsToSql = { firstName: 'first_name' };

    expect(() => sqlForPartialUpdate(dataToUpdate, jsToSql)).toThrowError(BadRequestError);
  });

  // Add more tests to cover edge cases and additional scenarios
});

module.exports = { sqlForPartialUpdate };
