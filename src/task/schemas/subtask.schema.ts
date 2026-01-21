import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SubTask extends Document {
  @Prop({ required: true, unique: true })
  sid: number;

  @Prop({ required: true })
  taskid: number;

  @Prop({ required: true })
  title: string;

  @Prop({ default: 'pending' })
  status: string;
}

export const SubTaskSchema = SchemaFactory.createForClass(SubTask);
