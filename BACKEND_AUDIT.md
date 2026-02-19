# 🔍 Auditoría Técnica Completa del Backend — LawCaseAI

> Evaluado por: Senior Backend Engineer · Fecha: 2026-02-18
> Archivos analizados: **34 archivos TypeScript** en `backend/src`

---

## 1️⃣ Seguridad 🔐

### 🔴 CRÍTICO — NoSQL Injection vía `$set` sin sanitizar

**Archivo:** [caseController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/caseController.ts#L147-L162) · [eventController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/eventController.ts#L81-L103)

**Problema:** `updateCase` y `updateEvent` pasan `req.body` directamente a `$set` sin filtrar campos. Un atacante puede modificar campos protegidos como `userId`, `status`, o inyectar operadores MongoDB.

```typescript
// ❌ ACTUAL — Vulnerable
const updates = req.body;
await Case.findOneAndUpdate(
  { _id: id, userId },
  { $set: updates },
  { new: true },
);

// ✅ MEJORADO — Whitelist de campos permitidos
const { name, client, description, status, practiceArea } = req.body;
const allowedUpdates: Partial<ICaseUpdate> = {};
if (name) allowedUpdates.name = name;
if (client) allowedUpdates.client = client;
if (description) allowedUpdates.description = description;
if (status && Object.values(CaseStatus).includes(status))
  allowedUpdates.status = status;

await Case.findOneAndUpdate(
  { _id: id, userId },
  { $set: allowedUpdates },
  { new: true, runValidators: true },
);
```

---

### 🔴 CRÍTICO — ReDoS vía `$regex` con input del usuario sin escapar

**Archivo:** [dashboardController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/dashboardController.ts#L126-L167) · [eventController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/eventController.ts#L21-L29)

**Problema:** El `searchGlobal` pasa directamente el query del usuario a `$regex`. Caracteres como `.*+?^${}()|[]\\` pueden causar ReDoS (Denial of Service por expresión regular catastrófica) o filtrar datos inesperados.

```typescript
// ❌ ACTUAL — Vulnerable a ReDoS
{ name: { $regex: query, $options: 'i' } }

// ✅ MEJORADO — Escapar caracteres especiales de regex
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
const safeQuery = escapeRegex(query)
{ name: { $regex: safeQuery, $options: 'i' } }

// 🏆 IDEAL — Usar MongoDB Text Index (ya existe en Case.ts)
await Case.find({ userId, $text: { $search: query } })
```

---

### 🔴 CRÍTICO — JWT Secret por defecto hardcodeado

**Archivo:** [config/index.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/config/index.ts#L17)

**Problema:** El secret JWT tiene un fallback: `'your-super-secret-jwt-key-change-this-in-production'`. Si `JWT_SECRET` no se configura en el `.env`, cualquier atacante puede forjar tokens válidos.

```typescript
// ❌ ACTUAL
secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

// ✅ MEJORADO — Fallar rápido si no hay secret
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is required')
}
// En config:
jwt: { secret: jwtSecret, expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
```

---

### 🔴 ALTO — Falta de validación de input en rutas de autenticación

**Archivo:** [routes/auth.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/routes/auth.ts)

**Problema:** Los endpoints `/register` y `/login` no tienen validación de `express-validator`. Un usuario puede enviar un email malformado, una contraseña vacía, o campos inesperados.

```typescript
// ❌ ACTUAL — Sin validación
router.post("/register", register);
router.post("/login", login);

// ✅ MEJORADO
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validation";

router.post(
  "/register",
  [
    body("name").trim().notEmpty().isLength({ max: 100 }),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body("lawFirm").trim().notEmpty().isLength({ max: 200 }),
    handleValidationErrors,
  ],
  register,
);
```

---

### 🟡 MEDIO — Sin CSRF Protection para cookies HttpOnly

**Archivo:** [authController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/authController.ts#L38-L43)

**Problema:** Se usan cookies `HttpOnly` + `sameSite: 'strict'` para almacenar el token, lo cual es bueno. Sin embargo, el header `Authorization` también es aceptado. Si se depende de cookies, debería implementarse CSRF tokens.

**Recomendación:** Elegir UNA estrategia: o cookies HttpOnly con CSRF token, o bearer tokens sin cookies. No ambas simultáneamente.

---

### 🟡 MEDIO — No hay blacklist de tokens en logout

**Archivo:** [authController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/authController.ts#L167-L185)

**Problema:** El logout solo limpia la cookie, pero el token JWT sigue siendo válido hasta su expiración (7 días). Un token interceptado seguirá funcionando.

```typescript
// ✅ Implementar token blacklist con Redis o MongoDB TTL collection
// En logout:
await TokenBlacklist.create({ token, expiresAt: decodedToken.exp });
// En authenticate middleware:
const isBlacklisted = await TokenBlacklist.findOne({ token });
if (isBlacklisted) return res.status(401).json({ message: "Token revoked" });
```

---

### 🟡 MEDIO — XSS Sanitization con regex es débil

**Archivo:** [middleware/validation.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/middleware/validation.ts#L51-L62)

**Problema:** El `sanitizeInput` usa regex para remover tags HTML. Esto es fácil de evadir con encoding alternativo, atributos `on*`, o inyección en contextos no-HTML.

```typescript
// ❌ ACTUAL — Regex fácil de evadir
req.body[key] = req.body[key]
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  .replace(/<[^>]*>/g, "");

// ✅ MEJORADO — Usar librería especializada
import xss from "xss";
req.body[key] = xss(req.body[key]);

// O mejor aún, usar mongo-sanitize para NoSQL:
import mongoSanitize from "express-mongo-sanitize";
app.use(mongoSanitize());
```

---

### 🟡 MEDIO — No hay password complexity validation

**Archivo:** [models/User.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/models/User.ts#L28-L33)

**Problema:** El modelo solo exige mínimo 8 caracteres. No hay validación de complejidad (mayúsculas, números, caracteres especiales).

---

### 🟡 MEDIO — Rate limiting genérico (1000 req/15min)

**Archivo:** [config/index.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/config/index.ts#L46-L48)

**Problema:** Se aplica un único rate limiter global a `/api`. Las rutas sensibles (`/login`, `/register`, `/password`) deberían tener límites específicos más estrictos para prevenir brute force.

```typescript
// ✅ Rate limiter específico para auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
router.post("/login", authLimiter, login);
```

---

### 🟢 BIEN — Aspectos positivos de seguridad

- ✅ Helmet configurado con CSP
- ✅ CORS con origin específico
- ✅ Password hashing con bcrypt (salt 12)
- ✅ Password field `select: false` en User model
- ✅ Ownership check en resources (case, file, event)
- ✅ Cookie HttpOnly + secure + sameSite

---

## 2️⃣ Arquitectura 🏗️

### 🔴 ALTO — Lógica de negocio directamente en Controllers

**Archivos:** Todos los controllers.

**Problema:** No existe una capa de servicio (Service Layer). La lógica de negocio (validar plan limits, crear registros, actualizar contadores) vive directamente en los controllers. Esto viola el principio de **Single Responsibility** y hace el código difícil de testear.

```
// ❌ ARQUITECTURA ACTUAL
Route → Controller (business logic + DB access + response formatting)

// ✅ ARQUITECTURA RECOMENDADA
Route → Controller (request/response) → Service (business logic) → Repository/Model (DB)
```

**Ejemplo concreto — `createCase` actual vs. mejorado:**

```typescript
// ❌ ACTUAL (en controller)
const user = await User.findById(userId);
if (user.currentCases >= user.planLimit) {
  /* ... */
}
const newCase = new Case({ name, client, description, userId });
await newCase.save();
user.currentCases += 1;
await user.save();

// ✅ MEJORADO (service layer)
// caseService.ts
export class CaseService {
  async createCase(userId: string, data: CreateCaseDTO): Promise<ICase> {
    return await mongoose.connection.transaction(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user) throw new NotFoundError("User not found");
      if (user.currentCases >= user.planLimit)
        throw new ForbiddenError("Plan limit reached");

      const [newCase] = await Case.create([{ ...data, userId }], { session });
      await User.updateOne(
        { _id: userId },
        { $inc: { currentCases: 1 } },
        { session },
      );
      return newCase;
    });
  }
}
```

---

### 🟡 MEDIO — Código duplicado en auth check

**Archivos:** Todos los controllers.

**Problema:** Cada función de controller repite el mismo patrón de verificación de `userId`:

```typescript
const userId = req.user?._id;
if (!userId) {
  res.status(401).json({ success: false, message: "Unauthorized" });
  return;
}
```

Esto se repite **18+ veces** en el codebase. El middleware `authenticate` ya garantiza que `req.user` existe, haciendo este check redundante.

---

### 🟡 MEDIO — `(req as any)` elimina type safety

**Archivos:** [paymentController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/paymentController.ts#L7), [routes/case.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/routes/case.ts), [routes/ai.ts](file:///c:/Users/projects/LawCaseAI/backend/src/routes/ai.ts)

**Problema:** Se usa `(req as any).user` en paymentController y `authenticate as any` en route definitions. Esto anula el sistema de tipos de TypeScript.

**Recomendación:** Cambiar el tipo del request a `IAuthRequest` y resolver los type errors correctamente.

---

### 🟡 MEDIO — Ruta `/api/payments` registrada dos veces

**Archivo:** [server.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/server.ts#L114) y [línea 122](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/server.ts#L122)

```typescript
app.use("/api/payments", paymentRoutes); // Línea 114
// ... más rutas ...
app.use("/api/payments", paymentRoutes); // Línea 122 — ¡DUPLICADA!
```

---

### 🟡 MEDIO — Archivos de rutas sin usar

**Archivo:** [routes/auth-new.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/routes/auth-new.ts)

**Problema:** Existe un archivo `auth-new.ts` que no está registrado en `server.ts`. Es código muerto.

---

## 3️⃣ Base de Datos 🗄️

### 🔴 ALTO — Race condition en el contador `currentCases`

**Archivo:** [caseController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/caseController.ts#L44-L45)

**Problema:** El incremento de `currentCases` no es atómico. Si dos requests llegan simultáneamente:

```typescript
// ❌ ACTUAL — Race condition
user.currentCases += 1; // Read-Modify-Write no atómico
await user.save();

// ✅ MEJORADO — Operación atómica
await User.updateOne({ _id: userId }, { $inc: { currentCases: 1 } });

// 🏆 IDEAL — Con transacción MongoDB
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  await Case.create([{ ...data, userId }], { session });
  await User.updateOne(
    { _id: userId },
    { $inc: { currentCases: 1 } },
    { session },
  );
});
```

---

### 🟡 MEDIO — Falta de índices compuestos

**Archivos:** Modelos.

**Problema:** Existen índices simples pero faltan compuestos que optimizarían queries frecuentes:

```typescript
// ✅ Índices recomendados
caseSchema.index({ userId: 1, status: 1 }); // getCases filtered by status
caseSchema.index({ userId: 1, createdAt: -1 }); // getCases sorted
eventSchema.index({ userId: 1, start: 1 }); // getEvents by date range
eventSchema.index({ userId: 1, status: 1, start: 1 }); // auto-close + fetch
caseFileSchema.index({ caseId: 1, userId: 1 }); // getCaseFiles
```

---

### 🟡 MEDIO — `getCases` sin paginación

**Archivo:** [caseController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/caseController.ts#L67)

**Problema:** `Case.find({ userId }).sort({ createdAt: -1 })` retorna TODOS los documentos sin límite.

```typescript
// ✅ MEJORADO — Con paginación
const page = parseInt(req.query.page as string) || 1;
const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
const skip = (page - 1) * limit;

const [cases, total] = await Promise.all([
  Case.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
  Case.countDocuments({ userId }),
]);

res.json({
  success: true,
  data: cases,
  pagination: { page, limit, total, pages: Math.ceil(total / limit) },
});
```

---

### 🟡 MEDIO — planLimit no se actualiza con `findByIdAndUpdate`

**Archivo:** [paymentController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/paymentController.ts#L96-L100)

**Problema:** `confirmPayment` usa `findByIdAndUpdate` para cambiar el plan, pero el middleware `pre('save')` que actualiza `planLimit` sólo se ejecuta en `.save()`, no en `findByIdAndUpdate`.

```typescript
// ❌ ACTUAL — planLimit NO se actualiza
await User.findByIdAndUpdate(userId, { plan: planId }, { new: true });

// ✅ MEJORADO
const user = await User.findById(userId);
user.plan = planId as UserPlan;
await user.save(); // Triggers pre('save') → updates planLimit
```

---

## 4️⃣ Performance 🚀

### 🟡 MEDIO — Lazy-update de eventos bloquea cada GET

**Archivo:** [eventController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/eventController.ts#L10-L19)

**Problema:** Cada `GET /api/events` ejecuta un `updateMany` para cerrar eventos pasados ANTES de responder. Esto añade latencia innecesaria a cada request.

```typescript
// ✅ MEJORADO — Cron job o background task + índice TTL
// O filtrar en query sin mutar datos en cada read
const events = await Event.find({
  ...query,
  $or: [{ status: "active", start: { $gte: now } }, { status: "closed" }],
});
```

---

### 🟡 MEDIO — Dashboard hace 5 queries secuenciales

**Archivo:** [dashboardController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/dashboardController.ts#L5-L123)

**Problema:** `getDashboardStats` ejecuta: `User.findById` + `user.save()` + `Case.aggregate` + `Case.aggregate` + `Case.find` + `Event.find` de forma secuencial.

```typescript
// ✅ MEJORADO — Paralelizar con Promise.all
const [caseStats, documentCount, recentCases, upcomingDeadlines] =
  await Promise.all([
    Case.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Case.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$fileCount" } } },
    ]),
    Case.find({ userId }).sort({ updatedAt: -1 }).limit(3).lean(),
    Event.find({ userId, start: { $gte: now } })
      .sort({ start: 1 })
      .limit(5)
      .lean(),
  ]);
```

---

### 🟡 MEDIO — No hay caching

**Problema:** No existe ninguna capa de cache (Redis, in-memory). Datos como `dashboardStats`, `billingInfo`, y `planLimits` son estáticos o cambian poco, pero se recalculan en cada request.

---

### 🟢 BIEN — Aspectos positivos de performance

- ✅ Compression middleware habilitado
- ✅ `.lean()` usado en queries de solo-lectura
- ✅ Body parser con `limit: '10mb'`

---

## 5️⃣ Código Limpio 🧹

### 🟡 MEDIO — Archivos sin utilizar / código muerto

| Archivo                 | Problema                                     |
| ----------------------- | -------------------------------------------- |
| `routes/auth-new.ts`    | No registrado en `server.ts`                 |
| `routes/chat.ts`        | Registrado pero ¿tiene controllers?          |
| `models/ChatMessage.ts` | Modelo existente pero sin controller de CRUD |

---

### 🟡 MEDIO — Mock data en producción

**Archivo:** [paymentController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/paymentController.ts#L17-L40), [userController.ts](file:///c:/Users/cowerin/projects/LawCaseAI/backend/src/controllers/userController.ts#L239-L247)

**Problema:** `getTransactionHistory` crea mock transactions si no hay datos reales. `getBillingInfo` genera un payment method falso (`Visa 4242`). Esto NO debería existir en producción.

```typescript
// ❌ Seed mock data on every call — ELIMINAR
if (transactions.length === 0) {
  await Transaction.create([{ /* mock data */ }])
}

// ❌ Hardcoded payment method fallback — ELIMINAR
paymentMethods: user.paymentMethods.length > 0 ? user.paymentMethods : [
  { id: 'pm_1', brand: 'Visa', last4: '4242', ... }
]
```

---

### 🟡 MEDIO — Debug logs en producción

**Archivos:** Múltiples controllers.

```typescript
// ❌ ACTUAL — console.log/error expuesto en producción
console.error("AI Chat Controller Error:", error);
console.log(`[SUPPORT REQUEST] From: ${user.email}`);
console.warn(`[AUTH] No token for ${req.method} ${req.url}`);

// ✅ MEJORADO — Usar un logger estructurado
import winston from "winston";
const logger = winston.createLogger({
  /* config */
});
logger.error("AI Chat error", { error: error.message, caseId, userId });
```

---

### 🟢 SE PUEDE SIMPLIFICAR

- Los repetidos bloques `try/catch` en controllers se pueden extraer a un wrapper `asyncHandler`.
- El patrón de response `{ success, message, data }` es consistente (✅ bien).

---

## 6️⃣ Manejo de Errores y Logs 📊

### 🟡 MEDIO — Error messages leaking información interna

**Archivos:** Múltiples controllers.

**Problema:** Los catch blocks reenvían `error.message` al cliente. Mensajes internos de MongoDB o Node.js pueden filtrar estructura de la DB o paths del servidor.

```typescript
// ❌ ACTUAL
const errorMessage =
  error instanceof Error ? error.message : "Failed to create case";
res.status(500).json({ success: false, message: errorMessage });

// ✅ MEJORADO
logger.error("Create case failed", { error, userId });
res
  .status(500)
  .json({ success: false, message: "An unexpected error occurred" });
```

---

### 🟡 MEDIO — No hay logging estructurado ni monitoreo

**Problema:** Solo se usa `morgan` para HTTP logs y `console.error` para errores. No hay:

- Logging estructurado (JSON logs con correlation IDs)
- Sistema de monitoreo (Sentry, Datadog, New Relic)
- Health check que verifique dependencias (MongoDB, R2, AI service)
- Métricas de latencia o error rates

---

### 🟢 BIEN — Global error handler

- ✅ El error handler global cubre Mongoose validation, JWT errors, y Multer errors.
- ✅ Errores de validación se formatean correctamente.

---

## 7️⃣ Escalabilidad 📈

### ¿Está listo para producción?

> **No.** El backend funciona para desarrollo y demo, pero tiene bloqueantes críticos para producción:

| Aspecto                        | Estado | Bloqueante                                 |
| ------------------------------ | ------ | ------------------------------------------ |
| Seguridad (NoSQL Injection)    | 🔴     | Sí — datos comprometidos                   |
| Seguridad (JWT Secret default) | 🔴     | Sí — tokens forjados                       |
| Mock payment data              | 🔴     | Sí — datos falsos en producción            |
| Race conditions                | 🟡     | Parcial — datos inconsistentes             |
| Input validation               | 🔴     | Sí — data integrity                        |
| Service layer                  | 🟡     | No bloqueante pero dificulta mantenimiento |

### ¿Escalaría con 1.000 usuarios concurrentes?

> **Parcialmente.** Los principales cuellos de botella serían:

1. **Primer cuello de botella:** La race condition en `currentCases` causaría inconsistencias al crear/eliminar casos concurrentemente.
2. **Segundo cuello de botella:** El dashboard ejecuta 5+ queries secuenciales sin cache.
3. **Tercer cuello de botella:** El lazy-update de eventos en cada GET `/api/events` bloquea reads.
4. **Cuarto cuello de botella:** `getCases` sin paginación podría retornar miles de documentos.

### ¿Qué cambiarías para hacerlo enterprise-ready?

1. **Capa de servicios** — Separar business logic de controllers
2. **Transacciones MongoDB** — Para operaciones multi-documento
3. **Redis** — Para caching de dashboard, sessions, y rate limiting distribuido
4. **Queue system** — Para AI operations y file processing (Bull/BullMQ)
5. **Structured logging** — Winston/Pino con correlation IDs
6. **Monitoring** — Sentry para errores, Datadog/Prometheus para métricas
7. **Input validation** — express-validator en TODAS las rutas
8. **Stripe real** — Reemplazar mock payment con Stripe webhooks
9. **Tests** — Unit tests para services, integration tests para APIs
10. **CI/CD** — Pipeline con lint, test, build, deploy automatizado

---

## 📋 Resumen Ejecutivo

| Categoría      | Críticos | Altos | Medios | Bajos |
| -------------- | -------- | ----- | ------ | ----- |
| Seguridad      | 3        | 1     | 5      | 0     |
| Arquitectura   | 0        | 1     | 4      | 0     |
| Base de Datos  | 0        | 1     | 3      | 0     |
| Performance    | 0        | 0     | 3      | 0     |
| Código Limpio  | 0        | 0     | 3      | 0     |
| Error Handling | 0        | 0     | 2      | 0     |
| **Total**      | **3**    | **3** | **20** | **0** |

### Prioridad de corrección recomendada:

1. 🔴 **Inmediato:** NoSQL Injection en `updateCase`/`updateEvent`/`createEvent`
2. 🔴 **Inmediato:** Validar JWT_SECRET al arrancar (fail-fast)
3. 🔴 **Inmediato:** Agregar `express-validator` a rutas de auth
4. 🔴 **Inmediato:** Escapar regex en búsquedas
5. 🟡 **Pronto:** Remover mock data de producción
6. 🟡 **Pronto:** Implementar operaciones atómicas para contadores
7. 🟡 **Pronto:** Agregar paginación a `getCases`/`getCaseFiles`
8. 🟡 **Planificado:** Crear service layer
9. 🟡 **Planificado:** Implementar structured logging
10. 🟢 **Opcional:** Cache con Redis, token blacklisting
