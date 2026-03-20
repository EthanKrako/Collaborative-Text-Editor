import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentEntity, DocumentSchema } from './schemas/document.schema';
import { DocumentService } from './document.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
  ],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}