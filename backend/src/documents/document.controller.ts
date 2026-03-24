import { Body, Controller, Get, Post } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { DocumentEntity } from "./schemas/document.schema";

@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Get()
    findAll(): Promise<Omit<DocumentEntity, 'yState'>[]> {
        return this.documentService.getAllDocuments();
    }

    @Post()
    async create(@Body() body: { title: string }): Promise<DocumentEntity> {
        return this.documentService.createDocument(body.title);
    }
}