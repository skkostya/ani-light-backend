import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const ENTITIES = [];

const SERVICES = [];

const CONTROLLERS = [];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  controllers: CONTROLLERS,
  providers: SERVICES,
})
export class CombineModule {}
