import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './schemas/task.schema';
import { SubTask } from './schemas/subtask.schema';
import { users } from './constants/users';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(SubTask.name) private subTaskModel: Model<SubTask>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const {
      title,
      uid,
      subtasks: dtoSubtasks,
      startTime,
      deadline,
    } = createTaskDto;

    const existing = await this.taskModel.findOne({
      title: new RegExp(`^${title}$`, 'i'),
    });

    const userExisting = users.some((u) => u.uid === uid);

    if (existing) {
      throw new HttpException({ message: 'TASK TITLE ALREADY EXISTS' }, 400);
    }

    if (startTime > deadline) {
      throw new HttpException(
        { message: 'start time is greater then the deadline time' },
        400,
      );
    }

    if (!userExisting) {
      throw new HttpException({ message: 'user is not registered' }, 400);
    }
    const taskId = Date.now();

    const newTask = await this.taskModel.create({
      id: taskId,
      uid,
      title,
      status: 'pending',
      startTime,
      deadline,
    });

    if (dtoSubtasks?.length) {
      await this.subTaskModel.insertMany(
        dtoSubtasks.map((s) => ({
          sid: Date.now() + Math.floor(Math.random() * 1000),
          taskid: taskId,
          title: s.title,
          status: 'pending',
        })),
      );
    }

    return newTask;
  }

  async findAll(query: { limit?: number; page?: number }) {
    const { limit, page } = query;

    const tasks = await this.taskModel.find().lean();
    const subtasks = await this.subTaskModel.find().lean();

    const tasksWithSubtasks = tasks.map((task) => ({
      ...task,
      subtasks: subtasks.filter((s) => s.taskid === task.id),
    }));

    if (!limit || !page) {
      return tasksWithSubtasks;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return tasksWithSubtasks.slice(startIndex, endIndex);
  }

  async findOne(id: number) {
    const task = await this.taskModel.findOne({ id }).lean();
    if (!task) throw new NotFoundException('Task not found');

    const subtasks = await this.subTaskModel.find({
      taskid: id,
    });

    return { ...task, subtasks };
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskModel.findOneAndUpdate({ id }, updateTaskDto, {
      new: true,
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(id: number) {
    const task = await this.taskModel.findOne({ id });
    if (!task) throw new NotFoundException('Task not found');

    await this.taskModel.deleteOne({ id });
    await this.subTaskModel.deleteMany({ taskid: id });

    return task;
  }

  async updateTocompleted(id: number) {
    const task = await this.taskModel.findOne({ id });
    if (!task) throw new NotFoundException('Task not found');

    const isPending = task.status === 'pending';
    const isFulfilled = task.status === 'completed';
    if (isPending) {
      throw new HttpException(
        { message: 'can not go fulfilled go to in-process ' },
        400,
      );
    }

    if (isFulfilled) {
      throw new HttpException({ message: 'already fulfilled task' }, 400);
    }

    const subtaskPending = await this.subTaskModel.findOne({
      taskid: id,
      status: 'pending',
    });

    if (subtaskPending) {
      throw new HttpException(
        {
          message: 'complete your subtasks first to mark the task as completed',
        },
        400,
      );
    }

    task.status = 'completed';
    return task.save();
  }

  async updateTopending(id: number) {
    const task = await this.taskModel.findOne({ id });
    if (!task) throw new NotFoundException('Task not found');

    const isFulfilled = task.status === 'completed';
    const isPending = task.status === 'pending';

    if (isFulfilled) {
      throw new HttpException(
        { message: 'task is already fulfilled cant be pending' },
        400,
      );
    }
    if (isPending) {
      throw new HttpException({ message: 'task already pending' }, 400);
    }

    task.status = 'pending';
    return task.save();
  }

  async updateToInprocess(id: number) {
    const task = await this.taskModel.findOne({ id });
    if (!task) throw new NotFoundException('Task not found');
    const isInProcess = task.status === 'in process';

    if (isInProcess) {
      throw new HttpException(
        {
          message:
            'task is already in-process if you did complete all your subtasks you can mark this tasks as completed',
        },
        400,
      );
    }

    task.status = 'in process';
    return task.save();
  }

  async updateTopendingSubtask(sid: number) {
    const subtask = await this.subTaskModel.findOne({ sid });
    if (!subtask) throw new NotFoundException('Task not found');

    const isFulfilled = subtask.status === 'completed';
    const isPending = subtask.status === 'pending';

    if (isFulfilled) {
      throw new HttpException(
        { message: 'sub-task is already fulfilled cant be pending' },
        400,
      );
    }
    if (isPending) {
      throw new HttpException({ message: 'already pending' }, 400);
    }

    subtask.status = 'pending';
    return subtask.save();
  }

  async updateToInprocessSubtask(sid: number) {
    const subtask = await this.subTaskModel.findOne({ sid });
    if (!subtask) throw new NotFoundException('Task not found');
    const isInProcess = subtask.status === 'in process';

    if (isInProcess) {
      throw new HttpException(
        {
          message:
            'sub task is already in-process you can mark this sub task as completed',
        },
        400,
      );
    }

    subtask.status = 'in process';
    return subtask.save();
  }

  async updateTocompletedSubtask(sid: number) {
    const subtask = await this.subTaskModel.findOne({ sid });
    if (!subtask) throw new NotFoundException('Task not found');

    const isPending = subtask.status === 'pending';
    const isFulfilled = subtask.status === 'completed';
    if (isPending) {
      throw new HttpException(
        { message: 'can not go fulfilled go to in process subtasks' },
        400,
      );
    }

    if (isFulfilled) {
      throw new HttpException({ message: 'sub task already completed' }, 400);
    }

    subtask.status = 'completed';
    return subtask.save();
  }
}
