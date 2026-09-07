const { users } = require("../data/db");

function listUsers(req, res) {
  // Use .map para recorrer la lista y quitarle la contraseña a cada uno de los usuarios 

  const newUsers = users.map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  return res.status(200).json({
    total: newUsers.length,
    newUsers //Envie los usuarios seguros sin su contraseña
  });
}

module.exports = {
  listUsers
};
