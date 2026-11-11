import fs from 'node:fs';
import { linkedQuery } from './lib/supabase-linked-cli.mjs';

// Explicit linked-database check. Schema preview and fixtures always roll back.
const version = '20261111180912';
const installed = linkedQuery(`select version from supabase_migrations.schema_migrations where version='${version}'`).length > 0;
const migration = installed ? '' : fs.readFileSync(`supabase/migrations/${version}_client_inquiry_records.sql`, 'utf8');
const tests = fs.readFileSync('supabase/tests/client_inquiry_records.sql', 'utf8');
console.log(linkedQuery(`begin;\n${migration}\n${tests}\nselect 'Client inquiry checks passed; fixtures rolled back' as result; rollback;`));
