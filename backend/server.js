const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const JWT_SECRET = 'chave-secreta-b2b-brasil'; 

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'b2b.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Erro ao conectar no banco:", err.message);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, full_name TEXT, email TEXT UNIQUE, password TEXT, role TEXT, account_status TEXT, company_name TEXT, cnpj TEXT, phone TEXT, address TEXT, city TEXT, state TEXT, about TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, title TEXT, description TEXT, category TEXT, price REAL, min_order INTEGER, stock INTEGER, unit TEXT, images TEXT, tags TEXT, price_tiers TEXT, status TEXT, supplier_id TEXT, supplier_name TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, buyer_id TEXT, supplier_id TEXT, status TEXT, total_amount REAL, items_json TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY, buyer_id TEXT, supplier_id TEXT, product_id TEXT, quantity INTEGER, message TEXT, status TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // NOVA TABELA DE CARRINHO ADICIONADA AQUI
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY, buyer_id TEXT, product_id TEXT, product_title TEXT, product_image TEXT, supplier_id TEXT, supplier_name TEXT, quantity INTEGER, unit_price REAL, variations_selected TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
    req.user = user; 
    next();
  });
};

app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name, role } = req.body;
  const id = uuidv4();
  const account_status = 'approved'; 
  const safeEmail = email.toLowerCase().trim();

  db.run(
    `INSERT INTO users (id, full_name, email, password, role, account_status) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, full_name, safeEmail, password, role, account_status],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        return res.status(500).json({ message: 'Erro ao criar usuário', error: err.message });
      }
      const user = { id, full_name, email: safeEmail, role, account_status };
      const token = jwt.sign({ id, email: safeEmail, role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user, token });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const safeEmail = email.toLowerCase().trim();

  db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [safeEmail, password], (err, user) => {
    if (err) return res.status(500).json({ message: 'Erro no servidor', error: err.message });
    if (!user) return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    delete user.password;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(
    `SELECT id, full_name, email, role, account_status, company_name, cnpj, phone, address, city, state, about FROM users WHERE id = ?`, 
    [req.user.id], 
    (err, user) => {
      if (err) return res.status(500).json({ message: 'Erro no servidor', error: err.message });
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
      res.json(user);
    }
  );
});

app.put('/api/auth/me', authenticateToken, (req, res) => {
  const { company_name, cnpj, phone, address, city, state, about } = req.body;
  db.run(
    `UPDATE users SET company_name = ?, cnpj = ?, phone = ?, address = ?, city = ?, state = ?, about = ? WHERE id = ?`,
    [company_name, cnpj, phone, address, city, state, about, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ message: 'Erro ao atualizar perfil', error: err.message });
      res.json({ message: 'Perfil atualizado' });
    }
  );
});

const handleGetList = (tableRaw) => (req, res) => {
  const table = tableRaw.replace('-', '_'); // Transforma cart-items em cart_items
  const queryParams = req.query;
  let query = `SELECT * FROM ${table} WHERE 1=1`;
  let params = [];

  for (const key in queryParams) {
    if (!key.startsWith('_')) {
      query += ` AND ${key} = ?`;
      params.push(queryParams[key]);
    }
  }

  if (queryParams._sort) {
    const isDesc = queryParams._sort.startsWith('-');
    const field = isDesc ? queryParams._sort.substring(1) : queryParams._sort;
    query += ` ORDER BY ${field} ${isDesc ? 'DESC' : 'ASC'}`;
  }

  if (queryParams._limit) {
    query += ` LIMIT ?`;
    params.push(Number(queryParams._limit));
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

app.get('/api/products', handleGetList('products'));
app.get('/api/orders', handleGetList('orders'));
app.get('/api/quotes', handleGetList('quotes'));
app.get('/api/cart-items', handleGetList('cart_items'));

app.post('/api/:entity', authenticateToken, (req, res) => {
  const entity = req.params.entity; 
  const allowedEntities = ['products', 'orders', 'quotes', 'cart-items']; // Adicionado cart-items
  
  if (!allowedEntities.includes(entity)) return res.status(404).json({ message: 'Entidade não encontrada' });

  const table = entity.replace('-', '_');
  const id = uuidv4();
  const data = { ...req.body, id };
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');

  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(data);
  });
});

app.put('/api/:entity/:id', authenticateToken, (req, res) => {
  const { entity, id } = req.params;
  const table = entity.replace('-', '_');
  const data = req.body;
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  const setString = keys.map(k => `${k} = ?`).join(', ');
  values.push(id); 

  db.run(`UPDATE ${table} SET ${setString} WHERE id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...data });
  });
});

app.delete('/api/:entity/:id', authenticateToken, (req, res) => {
  const { entity, id } = req.params;
  const table = entity.replace('-', '_');
  db.run(`DELETE FROM ${table} WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));