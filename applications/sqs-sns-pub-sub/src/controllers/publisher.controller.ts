import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { SnsService } from 'src/services/sns.service';

@Controller()
export class PublisherController {
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: SnsService,
  ) {}

  @Post('/publish')
  async handle(@Body() body: Record<string, any>): Promise<any> {
    if (!Object.keys(body).length) {
      throw new BadRequestException({
        error: true,
        message: 'Invalid Body',
      });
    }
    return this.notificationService.publish(body);
  }
}
