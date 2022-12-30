import { Controller, Get} from '@nestjs/common';
import config from 'src/config';

@Controller()
export class HomeController {
  constructor() {}

  @Get()
  index() {
    return '<h1>Hello world!</h1>' + config.APP_ENV;
  }
}
