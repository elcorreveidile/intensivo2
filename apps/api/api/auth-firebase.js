// Firebase Authentication Handlers
const admin = require('firebase-admin');

// Initialize Firebase
const serviceAccount = {
  type: 'service_account',
  project_id: 'aula-virtual-clmabroad',
  private_key_id: '72383bae083c3a217b9011dc69067d1c1bb952d9',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDF1Jek8M+5iDYq\nlc159UABqsKHo/vMRmTbxYUzwS2uWY5fZN0KA1AxaBS/K/JvdY2GK441FHOQsrok\n1Clrfdzon6ToNgmPB6P+BnzRlt9k4ATD9KY31x+allt4nIkjUfaxZkCuBO8xmrcb\nk0VctTMTyyN2M8ejf8ZChmCWlsTgD0iyFl4s+jujx59IcSqZDoRkPCyIiIAzfDxs\nLfBN6c+btG8A2IQOtdsIx+OJCkDdm9iC0111+/4pmER4BmKl4tvOmf8GvQZA0RGc\nNklyWOjx3ZRN8AeXsRsiEBYXExBiaw1aj9RKfx2Gt/oPed3bwpAh1/kvRKSBRZVj\nUImOx48JAgMBAAECggEAAJH0p20pvhhERrJkk5THPNH+CkfI1J2B0ifTMtNcUzev\nGzuGTw50I1ZQU/43jkZtlFzJBcJjtF+tfWhun6CO281E+4XXWHYOTQ+9+Zkoluj1\n3o40ke3g6ZBEHnh+BS/p6Pg5WL8LJO6UF0RhA2vCxEx2M1OiIEignMW4Hsr7sYUc\ndXvFMKe6WnYntNCp4o0K4/kMzjv/eYZvvvScxNle/YOHReqvvHvSGaqd4S8BWQEn\nWvvabB2HjWgC7BfJn/5Wa09anvBIoLQlNSsH82CYFTNboNlJYnS7waHX15zKY3wi\nnaxiSa/SEgde65KLr+hQbDkGl35qQc55ImlrUn+mkQKBgQDmc4OQBX29V8OAAh7i\nmAUMev5BVoF3lO67MCp7xaXlPWlqR1aoZQmAwh5Dlo+V78HXLJDklCUeCXwf9Vac\nlb75szGKWV/lOWLVg0CBQwXxXga5ZW/XBvKv4+4qYfZCrdOQK3S4yNHmtp732zMB\nE9fGekRFJBIv3BO1FBFwgwcjeQKBgQDbw0LFcfmETw3kBEC6lTZGlnlZGunHXBbh\nGv+X0yFmtl5IZjSQCdQ5FhUljf9I0bmqZ8Q1fnPftEUJbj2gEeKalFh0R9aviClm\nMrpSjyhTg6el7+a2wmUDkVq2ZiZ1kf81m4mf5oGpjDz+5IY2zwf9R2nv/k/Dzg2H\nr+o8597UEQKBgQCFMUJa3TGdW7o8o/0hzectHXESZmMRsFyCiAYl30hQxDvHF1A4\np5zkdE11lvGKITaRnMppsk35nFXHSs8yVUI5o54AbkOEgrRi3ydLDmfC5ytPwBbx\n2qwtiLlAeboRM9JRQyyFGFxo0ify7Rf/iW5u4n/OzlhMnRAu2lhyBOj9UQKBgQDY\nQHqyJIeuRMScffrcH/x61ZOvtSYbAWmaNaER27bghdCdWcWbf7CQRESm4eY11/rl\nzpprMXYAyjmtIAgQPclI53VrZ03BCTID2SM0Hp9GHyWXykyzxvLz4dLr7fUmeHY0\nYEu7R26MUu2qvWG9CVkJSX7bpNsFCPyTau4K5PiGoQKBgQCsS+A3wK6L+AkXC6a1\nqSMTxvnh5oJGPh/a4MNqO9fozeFxTQB7h0TBB/PbvjH4z/P96bet1+bdglsCuW1F\naA0R4LAfdD8XuGtFSoI8x0wyQsmdnbO1lBNIGLnSCch1tQGILu7UK1yC+mh5nMgv\nWTGWqhejc0k7nh8lm8B904ofUA==\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-fbsvc@aula-virtual-clmabroad.iam.gserviceaccount.com',
  client_id: '101956159453705692587',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth4/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40aula-virtual-clmabroad.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com'
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Helper to generate tokens
const generateTokens = (user) => {
  const token = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role
  })).toString('base64');

  return { token };
};

// Register endpoint
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    console.log('[AUTH-FIREBASE] Register request:', { email, firstName, lastName, role });

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Email, contraseña, nombre y apellidos son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Check if user exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (!snapshot.empty) {
      return res.status(400).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario con este email',
      });
    }

    // Hash password (simple implementation for compatibility)
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Create user in Firestore
    const userRef = db.collection('users').doc();
    const user = {
      id: userRef.id,
      email,
      passwordHash,
      firstName,
      lastName,
      role: role || 'estudiante',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(user);

    console.log('[AUTH-FIREBASE] User created:', user.id);

    // Generate token
    const { token } = generateTokens(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('[AUTH-FIREBASE] Register error:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      message: error.message,
    });
  }
};

// Login endpoint
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[AUTH-FIREBASE] Login request:', { email });

    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Email y contraseña son requeridos',
      });
    }

    // Find user
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    // Check password
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Cuenta inactiva',
        message: 'Tu cuenta ha sido desactivada',
      });
    }

    // Generate token
    const { token } = generateTokens(user);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('[AUTH-FIREBASE] Login error:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      message: error.message,
    });
  }
};

// Get current user (me)
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(7);

    try {
      // Decode base64 token
      const decoded = Buffer.from(token, 'base64').toString();
      const payload = JSON.parse(decoded);

      const userDoc = await db.collection('users').doc(payload.id).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'El usuario no existe',
        });
      }

      const user = userDoc.data();

      res.json({ user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePictureUrl: user.profilePictureUrl,
        nativeLanguage: user.nativeLanguage,
        proficiencyLevel: user.proficiencyLevel,
      }});
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token no es válido o ha expirado',
      });
    }
  } catch (error) {
    console.error('[AUTH-FIREBASE] GetMe error:', error);
    res.status(500).json({
      error: 'Error al obtener usuario',
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
