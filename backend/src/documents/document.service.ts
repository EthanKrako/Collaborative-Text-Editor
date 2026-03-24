import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Y from 'yjs';
import { DocumentEntity, DocumentDocument } from './schemas/document.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentService {
    constructor(
        @InjectModel(DocumentEntity.name)
        private documentModel: Model<DocumentDocument>,
    ) {}

    async createDocument(title: string): Promise<DocumentEntity> {
        const ydoc = new Y.Doc();

        const state = Y.encodeStateAsUpdate(ydoc);

        const createdDocument = new this.documentModel({
            id: randomUUID(),
            title,
            yState: Buffer.from(state),
            lastUpdatedAt: new Date(),
        });

        return createdDocument.save();
    }

    async getDocument(id: string): Promise<Y.Doc | null> {
        const doc = await this.documentModel.findOne({ id });

        if (!doc) return null;

        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, doc.yState);

        return ydoc;
    }

    async getAllDocuments(): Promise<Omit<DocumentEntity, 'yState'>[]> {
        return this.documentModel.find().select('id title lastUpdatedAt').lean().exec();
    }

    async getYjsState(id: string): Promise<Buffer | null> {
        const doc = await this.documentModel.findOne({ id });
        if (!doc) { 
            return null;
        }
        return doc.yState;
    }

    async updateDocument(id: string, ydoc: Y.Doc): Promise<void> {
        const state = Y.encodeStateAsUpdate(ydoc);

        await this.documentModel.updateOne(
            { id },
            { yState: Buffer.from(state), lastUpdatedAt: new Date() },
        );
    }

    async deleteDocument(id: string): Promise<void> {
        await this.documentModel.deleteOne({ id });
    }
}