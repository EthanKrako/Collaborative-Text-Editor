import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentGateway } from './documents/document.gateway';
import { DocumentModule } from './documents/document.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [DocumentModule, MongooseModule.forRoot(
    process.env.MONGODB_URI ??
      `mongodb://root:${process.env.MONGODB_ROOT_PASSWORD ?? 'root'}@db:27017/collaborative_text_editor?authSource=admin`,
  )],
  controllers: [AppController],
  providers: [AppService, DocumentGateway],
})
export class AppModule {}
