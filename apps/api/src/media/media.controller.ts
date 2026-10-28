import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { existsSync, createReadStream } from 'fs';
import { extname } from 'path';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MediaService, MEDIA_UPLOAD_DIR } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';

interface RequestUser {
  idUser: number;
  email: string;
  role: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

@UseGuards(JwtAuthGuard)
@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('children/:childId/media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: MEDIA_UPLOAD_DIR,
        // Nome gerado (UUID), nunca o nome original do arquivo — evita
        // colisão de nomes e evita expor nome de arquivo que o usuário
        // controla diretamente no sistema de arquivos do servidor.
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Tipo de arquivo não permitido (use JPG, PNG, WEBP ou PDF)'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  create(
    @CurrentUser() user: RequestUser,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() dto: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo obrigatório');
    }
    return this.mediaService.create(user.idUser, childId, dto, file.filename);
  }

  @Get('children/:childId/media')
  findAllForChild(@CurrentUser() user: RequestUser, @Param('childId', ParseIntPipe) childId: number) {
    return this.mediaService.findAllForChild(user.idUser, childId);
  }

  @Get('media/:id')
  findOne(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOneOwned(user.idUser, id);
  }

  // Download protegido — NUNCA expomos o arquivo via pasta pública estática.
  // Documento médico só sai do disco depois de passar por findOneOwned().
  @Get('media/:id/file')
  async download(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const found = await this.mediaService.findOneOwned(user.idUser, id);
    const filePath = this.mediaService.getAbsolutePath(found.imageUrl);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Arquivo não encontrado no servidor');
    }

    res.set({ 'Content-Disposition': `inline; filename="${found.title}"` });
    return new StreamableFile(createReadStream(filePath));
  }

  @Delete('media/:id')
  remove(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(user.idUser, id);
  }
}
