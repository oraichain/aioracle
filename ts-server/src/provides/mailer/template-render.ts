import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import config from 'src/config';
import { BadRequestException } from '@nestjs/common';

interface TemplateCollection {
  [key: string]: Function;
}

const templateLocation = config.basedir + 'templates/mail/';

const getViewContent = (view) => {
  try {
    return fs.readFileSync(
      templateLocation + view + '.html',
      {
        encoding: 'utf8',
      },
    );
  } catch (e) {
    throw new BadRequestException('Invalid template: ', view);
  }
};

const TemplateRender = (view, data) => {
  const content = getViewContent(view);
  const template = Handlebars.compile(content);
  return template(data);
}

export {
  TemplateRender
}
