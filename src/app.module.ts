import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BirdhouseModule } from './birdhouse/birdhouse.module';
import { AuthenticateBirdhouseMiddleware } from './middleware/authenticate-birdhouse.middleware';
import { config } from './orm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    BirdhouseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateBirdhouseMiddleware)
      .exclude({
        path: 'house',
        method: RequestMethod.POST
      })
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL
      })
  }
}