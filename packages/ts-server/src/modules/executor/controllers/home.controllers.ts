import {
  Controller,
  Get
} from '@nestjs/common';
import config from 'src/config';

@Controller('/')
export class HomeController {
  @Get('/')
  homeIndex() {
    return 'Welcome to the AI Oracle server - ' +
      'network: ' + config.NETWORK_TYPE + ' - ' +
      'chain: ' + config.CHAIN_ID + ' - ';
  }
}
