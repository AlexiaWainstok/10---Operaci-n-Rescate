# Registro de errores - Operación Rescate II

## Resumen

Se detectaron y corrigieron errores en la autenticación, el montaje de rutas, la validación de datos y la gestión de JWT. La aplicación ya cumple con los requisitos funcionales básicos del backend: registro, login, emisión de tokens, protección de rutas y rechazo de solicitudes no autorizadas.

| N   | Archivo                                                                   | Problema encontrado                                                                                                        | Cómo lo detectaron                                                                                                  | Solución aplicada                                                                                                                              |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | [src/app.js](../src/app.js)                                               | La API montaba el router de autenticación en "/api/login" en lugar de la raíz "/api".                                      | Se probó el endpoint de registro y se observó que no existía la ruta real.                                          | Se cambió el montaje a "/api" para que queden disponibles "/api/register" y "/api/login".                                                      |
| 2   | [src/middleware/authMiddleware.js](../src/middleware/authMiddleware.js)   | El middleware permitía pasar requests sin token y también aceptaba tokens inválidos.                                       | Se probó acceso a una ruta protegida sin Authorization y con un token falso.                                        | Se agregó validación explícita: si no hay token devuelve 401; si el JWT falla, devuelve 401; si es correcto, se guarda req.user y se continúa. |
| 3   | [src/middleware/authMiddleware.js](../src/middleware/authMiddleware.js)   | El middleware usaba la lógica equivocada de verificar el token sin secret y con condiciones que siempre permitían el paso. | El análisis del flujo mostró que la condición era invertida: "if (!token                                            |                                                                                                                                                | decoded)" permitía acceso a cualquier request. | Se reescribió el flujo para que la autenticación falle de forma explícita y segura. |
| 4   | [src/controllers/authController.js](../src/controllers/authController.js) | El login validaba la contraseña usando los parámetros en el orden incorrecto.                                              | El código llamaba a bcrypt.compare con argumentos invertidos, lo que hacía que la comparación fuera incorrecta.     | Se corrigió la llamada para usar bcrypt.compare(password, user.password).                                                                      |
| 5   | [src/controllers/authController.js](../src/controllers/authController.js) | El registro y login no validaban campos vacíos y devolvían respuestas HTTP incorrectas en algunos casos.                   | Las pruebas manuales con datos vacíos mostraban respuestas inconsistentes o que no estaban protegidas.              | Se agregaron validaciones con 400 para datos faltantes y 401 para credenciales inválidas.                                                      |
| 6   | [src/controllers/authController.js](../src/controllers/authController.js) | La respuesta del registro podía devolver un token incluso cuando el email ya estaba registrado o la validación fallaba.    | El flujo no hacía la validación de usuario duplicado con la respuesta correcta y el proyecto exigía HTTP correctos. | Se reforzó el flujo para bloquear duplicados con 400 y responder con estado coherente.                                                         |
| 7   | [src/utils/token.js](../src/utils/token.js)                               | El secret y el export del módulo estaban configurados con inconsistencias.                                                 | Se revisó la firma del JWT y el uso de la variable de entorno.                                                      | Se mantuvo el patrón correcto de firma con JWT_SECRET y exportación del helper.                                                                |
| 8   | [.env.example](../.env.example)                                           | El proyecto indicaba que debía existir una variable de entorno para JWT y PORT, pero no había ejemplo real.                | La lectura del README pedía copiar .env.example y el archivo no existía.                                            | Se agregó un ejemplo de configuración con PORT y JWT_SECRET.                                                                                   |

## Detalle técnico por problema

### 1) Ruta de autenticación incorrecta

- Qué ocurría: el router de autenticación estaba montado en "/api/login", pero el registro se espera en "/api/register" y el login en "/api/login". Eso hacía que la API no respondiera según la convención del backend.
- Por qué ocurría: el punto de montaje estaba mal definido en [src/app.js](../src/app.js).
- Cómo se solucionó: se reemplazó el montaje por "/api" para que ambas rutas queden disponibles bajo el prefijo correcto.
- Cómo se validó: se ejecutó el backend y se probó la creación de usuario y el login con requests reales; ambos respondieron con 200/201 y devolvieron token.

### 2) Middleware de autenticación que permitía requests sin token

- Qué ocurría: el middleware intentaba verificar el token solo si existía, pero la condición estaba invertida y admitía cualquier request.
- Por qué ocurría: la lógica tenía "if (!token || decoded)" y eso significa que si no había token o si el token podía decodificarse, se permitía el paso; además, jwt.verify se usaba sin el secret y no se manejaban errores correctamente.
- Cómo se solucionó: se reescribió la lógica para verificar la presencia del token, llamar a jwt.verify con el secret y devolver 401 cuando faltara o fuera inválido.
- Cómo se validó: se probó acceso a una ruta protegida sin token y con token inválido, y ambos devolvieron 401.

### 3) Login con comparación de contraseña incorrecta

- Qué ocurría: el código de bcrypt estaba llamando a compare con los argumentos invertidos, por lo que la comparación no era confiable.
- Por qué ocurría: bcrypt.compare debe recibir texto plano y hash, en ese orden.
- Cómo se solucionó: se reordenó la llamada y se respetó la API de bcrypt.
- Cómo se validó: se hizo login con credenciales correctas e incorrectas. El caso correcto devolvió token y el incorrecto devolvió 401.

### 4) Validación insuficiente y respuestas HTTP inconsistentes

- Qué ocurría: el backend no validaba campos vacíos con la frecuencia necesaria y respondía con códigos no adecuados para errores de autenticación.
- Por qué ocurría: la lógica no hacía return en varios puntos y el manejo de errores no era consistente.
- Cómo se solucionó: se agregaron validaciones para datos faltantes y estados apropiados para login no autorizado, registro duplicado y accesos sin permisos.
- Cómo se validó: se ejecutaron pruebas de registro con datos inválidos, login con contraseña incorrecta y acceso sin token; las respuestas tuvieron los códigos esperados.

### 5) Manejo de secreto JWT y entorno

- Qué ocurría: el proyecto necesitaba usar una variable de entorno JWT_SECRET para la firma del token, pero el repositorio no tenía un ejemplo real de configuración.
- Por qué ocurría: se pedía copiar .env.example, pero ese archivo no existía.
- Cómo se solucionó: se creó .env.example con PORT y JWT_SECRET.
- Cómo se validó: el backend arrancó correctamente con la variable exportada en la sesión de pruebas y generó JWT válidos.

### 6) Protección de rutas de administración

- Qué ocurría: la ruta admin estaba protegida por un middleware, pero el control de permisos por rol no estaba siendo evaluado con la lógica segura correcta.
- Por qué ocurría: el middleware validaba identidad, pero la autorización de admin debía hacerse en la ruta con comprobación de req.user.role.
- Cómo se solucionó: la ruta en [src/routes/adminRoutes.js](../src/routes/adminRoutes.js) verifica si el usuario tiene rol admin y devuelve 403 si no lo tiene.
- Cómo se validó: un usuario normal accedió a /api/users/all con JWT válido y recibió 403, mientras que un usuario admin debería poder entrar si posee ese rol.
