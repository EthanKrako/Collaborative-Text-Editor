import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentDocument = DocumentEntity & Document;

@Schema()
export class DocumentEntity {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: Buffer, required: true })
  yState: Buffer;

  @Prop({ required: true })
  lastUpdatedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);