const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
   // Guarde el id y el rol en el token para que los middlewares puedan identificarlos
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET || "super-secret", // Doble T en Secret 
    { expiresIn: "1h" } // Cambiado de 2 segundos a 1 hora
  );
}
//le faltaba una S a export
module.exports = {
  signToken
};
