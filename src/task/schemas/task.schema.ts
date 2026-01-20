import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop()
  id: number;

  @Prop()
  title: string;

  @Prop()
  uid: string;

  @Prop()
  startTime: string;

  @Prop()
  deadline:string;
}

export const UserSchema = SchemaFactory.createForClass(Task);
