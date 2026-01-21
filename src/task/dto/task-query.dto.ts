import { IsOptional, IsNumber } from 'class-validator';

export class TaskQueryDto {
  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  page?: number;
}
