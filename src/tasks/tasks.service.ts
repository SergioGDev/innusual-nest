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
      id:
        this.tasks.length > 0
          ? Math.max(...this.tasks.map((t) => t.id)) + 1
          : 1,
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
