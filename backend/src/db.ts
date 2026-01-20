// eslint-disable-next-line @typescript-eslint/no-var-requires
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

export default sql;
