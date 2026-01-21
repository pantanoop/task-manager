import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task, TaskSchema } from './schemas/task.schema';
import { SubTask, SubTaskSchema } from './schemas/subtask.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: SubTask.name, schema: SubTaskSchema },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
