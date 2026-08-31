const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const { getProfile, updateMe } = require("../controllers/userController");

const router = express.Router();

//cambie el orden de middleware y authMiddleware, porque primero necesitas verificar tu identidad para despues poder buscar datos especificos 
router.get("/me", authMiddleware,getProfile);
router.put("/me", authMiddleware, updateMe);
//agregue el authMiddleware, asi no cualquiera puede ver todas las ordenes de compra 
router.get("/orders",authMiddleware, (req, res) => {
  return res.status(200).json({
    orders: [
      { id: "A1", total: 1250 },
      { id: "A2", total: 4900 }
    ]
  });
});

module.exports = router;
