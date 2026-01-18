const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const db = new Database('db/arc.db');

const email = 'arc@admin.com';
const password = 'admin123'; // يمكنك تغييرها
const password_hash = bcrypt.hashSync(password, 10);

const user = {
  id: 'admin',
  email,
  password_hash,
  role: 'admin',
  status: 'active'
};

db.prepare(`INSERT OR REPLACE INTO users (id, email, password_hash, role, status) VALUES (@id, @email, @password_hash, @role, @status)`).run(user);

console.log('Admin user added:', email);
