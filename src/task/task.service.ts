import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { tasks } from './constants/tasks';
import { subtasks } from './constants/subatasks';

@Injectable()
export class TaskService {
  create(createTaskDto: CreateTaskDto) {
    const {
      title,
      uid,
      subtasks: dtoSubtasks,
      startTime,
      deadline,
    } = createTaskDto;

    const existing = tasks.find(
      (t) => t.title.toLowerCase() === title.toLowerCase(),
    );
    // console.log(existing);
    if (existing) {
      console.log('hjvchcbhbc');
      throw new HttpException({ message: 'TASK TITLE ALREADY EXISTS' }, 400);
    }

    // if (existing) {
    //   console.log('hjvchcbhbc');
    //   throw new HttpException ('TASK TITLE ALREADY EXISTS');
    // }
    const taskId = Date.now();

    const newTask = {
      id: taskId,
      uid,
      title,
      status: 'pending',
      startTime,
      deadline,
    };

    if (startTime > deadline) {
      throw new HttpException(
        { message: 'start time is greater then the deadline time' },
        400,
      );
    }

    tasks.push(newTask);

    if (dtoSubtasks && dtoSubtasks.length > 0) {
      dtoSubtasks.forEach((s) => {
        const newSubtask = {
          sid: Date.now() + Math.floor(Math.random() * 1000),
          taskid: taskId,
          title: s.title,
          status: 'pending',
        };
        subtasks.push(newSubtask);
      });
    }
    console.log(newTask);
    return newTask;
  }

  findAll() {
    return tasks.map((task) => ({
      ...task,
      subtasks: subtasks.filter((s) => s.taskid === task.id),
    }));
  }

  findOne(id: number) {
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException('Task not found');

    return {
      ...task,
      subtasks: subtasks.filter((s) => s.taskid === id),
    };
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) throw new NotFoundException('Task not found');

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updateTaskDto,
    };

    return tasks[taskIndex];
  }

  remove(id: number) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundException('Task not found');

    const deletedTask = tasks[index];

    tasks.splice(index, 1);

    for (let i = 0; i <= subtasks.length - 1; i--) {
      if (subtasks[i].taskid === id) {
        subtasks.splice(i, 1);
      }
    }

    return deletedTask;
  }

  updateTocompleted(id: number) {
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) throw new NotFoundException('Task not found');
    let isPending = tasks[taskIndex].status === 'pending' ? true : false;
    if (isPending) {
      throw new HttpException(
        { message: 'can not go fulfilled go to in process ' },
        400,
      );
    }
    let SubtaskPending = subtasks.find(
      (s) => s.taskid === id && s.status == 'pending',
    );
    let isSubtaskPending = SubtaskPending ? true : false;
    if (isSubtaskPending) {
      throw new HttpException(
        { message: 'Tcomplete your subtasks first' },
        400,
      );
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status: 'completed',
    };
    return tasks[taskIndex];
  }

  updateTopending(id: number) {
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) throw new NotFoundException('Task not found');
    let isFulfilled = tasks[taskIndex].status === 'completed' ? true : false;
    let isPending = tasks[taskIndex].status === 'pending' ? true : false;
    if (isFulfilled) {
      throw new HttpException(
        { message: 'task is already fulfilled cant be pending' },
        400,
      );
    }
    if (isPending) {
      throw new HttpException({ message: 'already pending' }, 400);
    }
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status: 'pending',
    };
    return tasks[taskIndex];
  }
  updateToInprocess(id: number) {
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) throw new NotFoundException('Task not found');

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status: 'in process',
    };
    return tasks[taskIndex];
  }
  updateTopendingSubtask(id: number) {
    const taskIndex = subtasks.findIndex((t) => t.sid === id);
    if (taskIndex === -1) throw new NotFoundException('Task not found');
    let isFulfilled = subtasks[taskIndex].status === 'completed' ? true : false;
    let isPending = subtasks[taskIndex].status === 'pending' ? true : false;
    if (isFulfilled) {
      console.log('error');
      throw new HttpException(
        { message: 'sub-task is already fulfilled cant be pending' },
        400,
      );
    }
    if (isPending) {
      console.log('error');
      throw new HttpException({ message: 'already pending' }, 400);
    }
    subtasks[taskIndex] = {
      ...subtasks[taskIndex],
      status: 'pending',
    };
    return subtasks[taskIndex];
  }
  updateToInprocessSubtask(id: number) {
    const taskIndex = subtasks.findIndex((t) => t.sid === id);
    if (taskIndex === -1) throw new NotFoundException('Task not found');

    subtasks[taskIndex] = {
      ...subtasks[taskIndex],
      status: 'in process',
    };
    return subtasks[taskIndex];
  }
  updateTocompletedSubtask(id: number) {
    const taskIndex = subtasks.findIndex((t) => t.sid === id);
    if (taskIndex === -1) throw new NotFoundException('Task not found');
    let isPending = subtasks[taskIndex].status === 'pending' ? true : false;
    if (isPending) {
      throw new HttpException(
        { message: 'can not go fulfilled go to in process subtasks' },
        400,
      );
    }
    subtasks[taskIndex] = {
      ...subtasks[taskIndex],
      status: 'completed',
    };
    return subtasks[taskIndex];
  }
}
