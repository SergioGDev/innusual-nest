# NestJS Demo — Arquitectura, flujo de ejecución y demo práctica

Este repositorio contiene una demo sencilla de NestJS creada como apoyo a una charla técnica orientada a desarrolladores TypeScript.

El objetivo es mostrar, de forma práctica, cómo estructurar una aplicación backend utilizando NestJS y entender su flujo de ejecución.

---

## 🚀 Objetivos del proyecto

- Entender la arquitectura base de NestJS
- Ver cómo se organizan módulos, controllers y services
- Aplicar validación con DTOs y pipes
- Gestionar errores de forma estructurada
- Añadir lógica transversal con guards
- Visualizar el flujo completo de una petición

---

## 🧱 Estructura del proyecto

```bash
src/
├── main.ts
├── app.module.ts
└── tasks/
    ├── dto/
    │   ├── create-task.dto.ts
    │   └── update-task.dto.ts
    ├── entities/
    │   └── task.entity.ts
    ├── guards/
    │   └── api-key.guard.ts
    ├── tasks.controller.ts
    ├── tasks.service.ts
    └── tasks.module.ts
```

---

## ⚙️ Instalación

```bash
npm install
```

---

## ▶️ Ejecutar el proyecto

```bash
npm run start:dev
```

La API estará disponible en:

```
http://localhost:3000
```

---

## 📌 Endpoints disponibles

### Obtener todas las tareas

```bash
GET /tasks
```

### Obtener una tarea por id

```bash
GET /tasks/:id
```

### Crear una tarea

```bash
POST /tasks
```

### Actualizar una tarea

```bash
PATCH /tasks/:id
```

### Eliminar una tarea

```bash
DELETE /tasks/:id
```

---

## 🔐 Protección con API Key

La API está protegida mediante un Guard sencillo.

### Header requerido

```bash
x-api-key: demo123
```

### Ejemplo

```bash
curl http://localhost:3000/tasks \
  -H "x-api-key: demo123"
```

---

## ✅ Validación

La aplicación utiliza:

- `class-validator`
- `class-transformer`
- `ValidationPipe` global

### Ejemplo de error

```json
{
  "statusCode": 400,
  "message": ["title must be longer than or equal to 3 characters"],
  "error": "Bad Request"
}
```

---

## 🔁 Flujo de una petición

El flujo de ejecución en NestJS en esta demo sigue el siguiente patrón:

```
Request
  → Guard
  → Pipe (validación)
  → Controller
  → Service
  → Response
```

---

## 🧠 Conceptos clave demostrados

- Arquitectura modular
- Controllers y Services
- Dependency Injection
- DTOs y validación
- Manejo de errores (`NotFoundException`)
- Pipes (`ValidationPipe`, `ParseIntPipe`)
- Guards (`ApiKeyGuard`)

---

## 📦 Tecnologías

- NestJS
- TypeScript
- class-validator
- class-transformer

---

## 🎯 Notas

- La demo utiliza datos en memoria (no base de datos)
- Pensada para fines educativos y de presentación
- Estructura fácilmente extensible a proyectos reales

---

## 📚 Recursos

- [https://docs.nestjs.com](https://docs.nestjs.com)
- [https://github.com/nestjs/nest](https://github.com/nestjs/nest)

---

## 🧩 Conclusión

Esta demo muestra cómo, con muy poco código, NestJS permite construir una API backend:

- estructurada
- validada
- mantenible
- y preparada para escalar

---

## 🙌 Autor

SergioGDev
