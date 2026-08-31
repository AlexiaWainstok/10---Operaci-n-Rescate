const express = require("express");
//importe authMiddleware
const authMiddleware = require("../middleware/authMiddleware");
const { listUsers } = require("../controllers/adminController");

const router = express.Router();

// Ponemos a authMiddleware ANTES de listUsers
router.get("/all", authMiddleware, (req, res, next) => {
  // Si el token es válido pero el usuario NO es admin, no lo aceptamos
  if (req.user && req.user.role === "admin") {
    return next(); // Si es admin, pasa al destino final
  }
  return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador" });
}, listUsers);


module.exports = router;
