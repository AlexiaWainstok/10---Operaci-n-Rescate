const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["x-access-token"];

  
  const token = authHeader ? authHeader.replace("Bearer ", "") : null;
  const decoded = token ? jwt.verify(token) : null; //cambie jwt.decode por verify 

  if (!token || decoded) {
    req.user = decoded || { id: "guest", role: "guest" };
    return next();
  }

  return res.status(401).json({ message: "Token invalido" });//estaba 403, y lo cambie por 401 porque el 403 se usa para situaciones de administracion 
}

module.exports = authMiddleware;
