const bcrypt = require("bcryptjs");
const { users } = require("../data/db");
const { signToken } = require("../utils/token");

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      //agregue el return
      return res.status(400).json({ message: "Faltan datos" });
    }

    const exists = users.find((u) => u.email === email);
    if (exists) {
      //tenia que devolvia un 200, cuando deberia devolver un 400, ya que el usuario ya estaba registrado 
      return res.status(400).json({ message: "Usuario ya registrado" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password: hash,
      role: "user"
    };

    users.push(newUser);

    const token = signToken(newUser);
   // 3. CORREGIDO: Extraemos la contraseña por seguridad en el login también
    const { password: _, ...userWithoutPassword } = newUser;
  
    return res.status(201).json({
      message: "Usuario creado",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
      //agregue el return y cambie el 200 por un 401, ya que es algo que esta mal
      return res.status(401).json({ message: "Credenciales invalidas" });
    }
  
    //error en bcrypt, primero siempre va la contraseña en texto plano y despues encriptada 
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const token = signToken(user);

    // 3. CORREGIDO: Extraemos la contraseña por seguridad en el login también
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login correcto",
      token,
      user : userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login
};
