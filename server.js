import jsonServer from 'json-server';
import jwt from 'jsonwebtoken';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'your-secret-key';
const expiresIn = '1h';

// Create a token from a payload
const createToken = (payload) => jwt.sign(payload, SECRET_KEY, { expiresIn });

// Verify the token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};

// Check if user exists in the database
const isAuthenticated = ({ email, password }) => {
  const users = router.db.get('users').value();
  return users.some(user => user.email === email && user.password === password);
};

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Signup endpoint
server.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  const users = router.db.get('users').value();

  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = { id: Date.now(), email, password, name };
  router.db.get('users').push(newUser).write();

  const token = createToken({ email, name });
  res.status(201).json({ token });
});

// Login endpoint
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!isAuthenticated({ email, password })) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  const user = router.db.get('users').find({ email }).value();
  const token = createToken({ email, name: user.name });

  res.status(200).json({ token });
});

// Middleware to protect routes
server.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
});

// Dashboard route - Fetch user data
server.get('/api/dashboard', (req, res) => {
  const user = router.db.get('users').find({ email: req.user.email }).value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({ message: 'Welcome to your dashboard', user });
});

server.use(router);
server.listen(3000, () => {
  console.log('✅ JSON Server is running on port 3000');
});

