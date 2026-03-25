import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { DocumentEntity } from "./schemas/document.schema";

@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Get()
    findAll(): Promise<Omit<DocumentEntity, 'yState'>[]> {
        return this.documentService.getAllDocuments();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<DocumentEntity> {
        return await this.documentService.getDocument(id);
    }

    @Post()
    async create(@Body() body: { title: string }): Promise<DocumentEntity> {
        return this.documentService.createDocument(body.title);
    }
}