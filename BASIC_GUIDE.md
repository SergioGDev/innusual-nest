# Guía básica — Demo NestJS

Guía paso a paso para crear desde cero un proyecto NestJS con una resource CRUD completa (`tasks`), validación automática y protección con un Guard.

---

## 1. Crear el proyecto base

```bash
npm i -g @nestjs/cli
nest new nest-demo
```

Esto genera la estructura inicial del proyecto:

* `src/main.ts` — Punto de entrada de la aplicación.
* `src/app.module.ts` — Módulo raíz.
* `src/app.controller.ts` — Controlador base.
* `src/app.service.ts` — Servicio base.
* `src/app.controller.spec.ts` — Test del controlador.
* `test/app.e2e-spec.ts` — Test end-to-end básico.
* `test/jest-e2e.json` — Configuración de tests e2e.
* `package.json`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `README.md`

---

## 2. Arrancar el proyecto

```bash
cd nest-demo
npm run start:dev
```

El proyecto queda funcional y accesible en `http://localhost:3000`.

---

## 3. Crear la resource `tasks`

```bash
nest g resource tasks
```

(Alias corto: `nest g res tasks`)

El CLI pedirá:

* **Tipo de transporte**: seleccionar `REST API`
* **Generar endpoints CRUD**: `Yes`

Esto genera una feature CRUD completa:

* `src/tasks/tasks.module.ts` — Módulo de tasks.
* `src/tasks/tasks.controller.ts` — Controlador con endpoints CRUD.
* `src/tasks/tasks.service.ts` — Servicio con lógica inicial.
* `src/tasks/dto/create-task.dto.ts` — DTO de creación.
* `src/tasks/dto/update-task.dto.ts` — DTO de actualización.
* `src/tasks/entities/task.entity.ts` — Entidad base.
* Archivos `.spec.ts` asociados.

---

## 4. Estructura del proyecto tras generar `tasks`

```
src/
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
└── tasks/
    ├── dto/
    │   ├── create-task.dto.ts
    │   └── update-task.dto.ts
    ├── entities/
    │   └── task.entity.ts
    ├── guards/
    │   └── api-key.guard.ts
    ├── tasks.controller.spec.ts
    ├── tasks.controller.ts
    ├── tasks.module.ts
    ├── tasks.service.spec.ts
    └── tasks.service.ts
```

---

## 5. Instalar dependencias de validación

```bash
npm install class-validator class-transformer
```

NestJS utiliza estas librerías junto con `ValidationPipe` para validar automáticamente los datos de entrada definidos en los DTOs.

---

## 6. Activar validación global en `main.ts`

Editar `src/main.ts`:

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

* `whitelist: true` — elimina propiedades no definidas en el DTO.
* `forbidNonWhitelisted: true` — rechaza la request si llegan campos extra.
* `transform: true` — transforma tipos de entrada automáticamente.

---

## 7. Definir la entidad `Task`

Editar `src/tasks/entities/task.entity.ts`:

```ts
export class Task {
  id: number;
  title: string;
  description?: string;
  done: boolean;
}
```

Es una clase simple que representa una tarea. Podría sustituirse por una entidad de base de datos más adelante.

---

## 8. Definir `CreateTaskDto`

Editar `src/tasks/dto/create-task.dto.ts`:

```ts
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
```

* `title` es obligatorio (mínimo 3 caracteres).
* `description` es opcional, pero si se envía debe tener al menos 5 caracteres.
* `done` es opcional.

---

## 9. Definir `UpdateTaskDto`

Editar `src/tasks/dto/update-task.dto.ts`:

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

`PartialType` reutiliza `CreateTaskDto` haciendo todos los campos opcionales.

---

## 10. Implementar `TasksService`

Editar `src/tasks/tasks.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: 1,
      title: 'Preparar charla de NestJS',
      description: 'Crear slides y demo práctica',
      done: false,
    },
    {
      id: 2,
      title: 'Revisar módulo tasks',
      description: 'Explicar controller y service',
      done: true,
    },
  ];

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task {
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      throw new NotFoundException(`Task con id ${id} no encontrada`);
    }

    return task;
  }

  create(createTaskDto: CreateTaskDto): Task {
    const newTask: Task = {
      id: this.tasks.length > 0 ? Math.max(...this.tasks.map((t) => t.id)) + 1 : 1,
      title: createTaskDto.title,
      description: createTaskDto.description,
      done: createTaskDto.done ?? false,
    };

    this.tasks.push(newTask);
    return newTask;
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);

    Object.assign(task, updateTaskDto);

    return task;
  }

  remove(id: number): { message: string } {
    const task = this.findOne(id);

    this.tasks = this.tasks.filter((t) => t.id !== task.id);

    return {
      message: `Task con id ${id} eliminada correctamente`,
    };
  }
}
```

El service trabaja con datos en memoria. Si una tarea no existe, lanza `NotFoundException` (respuesta HTTP 404 automática).

---

## 11. Implementar `TasksController`

Editar `src/tasks/tasks.controller.ts`:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
```

* `@UseGuards(ApiKeyGuard)` protege todas las rutas del controller (ver paso 12).
* `@Body()` recoge el payload de la request.
* `@Param()` recoge parámetros de ruta.
* `ParseIntPipe` valida que `id` sea numérico.

---

## 12. Crear el Guard `ApiKeyGuard`

Crear `src/tasks/guards/api-key.guard.ts`:

```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (apiKey !== 'demo123') {
      throw new UnauthorizedException('API key inválida o no proporcionada');
    }

    return true;
  }
}
```

El Guard se ejecuta antes del controller. Comprueba que la cabecera `x-api-key` contenga el valor `demo123`. Si no, devuelve `401 Unauthorized`.

---

## 13. Probar la API

Todas las peticiones a `/tasks` requieren la cabecera `x-api-key: demo123`.

### Obtener todas las tareas

```bash
curl http://localhost:3000/tasks \
  -H "x-api-key: demo123"
```

### Obtener una tarea por id

```bash
curl http://localhost:3000/tasks/1 \
  -H "x-api-key: demo123"
```

### Crear tarea válida

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo123" \
  -d '{
    "title": "Explicar ValidationPipe",
    "description": "Mostrar validación automática en la demo"
  }'
```

### Crear tarea inválida (título demasiado corto)

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo123" \
  -d '{
    "title": "Hi"
  }'
```

Respuesta esperada: `400 Bad Request`

### Actualizar tarea

```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo123" \
  -d '{
    "done": true
  }'
```

### Eliminar tarea

```bash
curl -X DELETE http://localhost:3000/tasks/2 \
  -H "x-api-key: demo123"
```

### Acceso sin API key

```bash
curl http://localhost:3000/tasks
```

Respuesta esperada: `401 Unauthorized`

### Parámetro inválido

```bash
curl http://localhost:3000/tasks/abc \
  -H "x-api-key: demo123"
```

Respuesta esperada: error de validación

### Recurso inexistente

```bash
curl http://localhost:3000/tasks/999 \
  -H "x-api-key: demo123"
```

Respuesta esperada: `404 Not Found`

---

## 14. Flujo de una petición

```
Request → Guard → Pipes → Controller → Service → Response
```

1. **Guard** — Decide si la petición tiene acceso (API key).
2. **Pipes** — Validan y transforman los datos de entrada (DTOs, `ParseIntPipe`).
3. **Controller** — Interpreta la petición HTTP y delega al service.
4. **Service** — Ejecuta la lógica de negocio.

### Respuestas según el caso

| Caso | Código HTTP |
|---|---|
| Acceso sin API key válida | `401 Unauthorized` |
| Datos de entrada inválidos | `400 Bad Request` |
| Recurso no encontrado | `404 Not Found` |
| Petición correcta | `200 OK` / `201 Created` |

---

## Comandos de referencia

```bash
# Crear proyecto
nest new nest-demo

# Crear resource CRUD
nest g resource tasks

# Instalar validación
npm install class-validator class-transformer

# Arrancar en desarrollo
npm run start:dev
```
