import * as sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/mail';
import * as fs from 'fs';
import config from 'src/config';
import { logError } from 'src/provides/log.provide';
import { TemplateRender } from './template-render';

sgMail.setApiKey(config.SENDGRID_API_KEY);

async function AppMailer(to, subject, options?) {
  options = Object.assign({
    from: config.SENDGRID_SENDER,
    isHtml: true,
    attachments: null, // type Attachment nodemailer/lib/mailer
    template: null,
    templateData: {},
    content: null,
    attachDelete: false, // after send mail
    attachRenameFlag: false, // after send mail
  }, options);
  
  const msg = {
    from: options.from,
    to: to,
    subject: subject,
  } as MailDataRequired;

  if (options.template) {
    options.content = TemplateRender(options.template, options.templateData);
  }

  if (options.isHtml) {
    msg["html"] = options.content;
  } else {
    msg["text"] = options.content;
  }

  if (options.attachments) {
    msg['attachments'] = attachmentsAppend(options.attachments);
  }

  try {
    await sgMail.send(msg);
    execAttachWhenSentDone(options.attachments, options);
  } catch (error) {
    logError(error);
    return error;
  }
}

function execAttachWhenSentDone(attachments, options) {
  if (!attachments || attachments.length === 0 || (!options.attachDelete && !options.attachRenameFlag)) {
    return null;
  }
  attachments.forEach(function(item) {
    if (!item.path) {
      return true;
    }
    if (options.attachDelete) {
      fs.unlinkSync(item.path);
    } else if (options.attachRenameFlag) {
      fs.renameSync(item.path, item.path + `_${Date.now()}__old`);
    }
  });
}

/**
 * exec list file in mail
 *
 * @param attachments list object {path: path_to_file}
 * @returns list
 */
function attachmentsAppend(attachments) {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  const attachMail = [];
  for (const i in attachments) {
    const item = attachments[i]
    if (!item.path) {
      continue;
    }
    const bufferData = fs.readFileSync(item.path);
    attachMail.push({
      content: bufferData.toString('base64'),
      filename: item.fileName ?? item.path.substr(item.path.lastIndexOf('/') + 1),
      type: item.type ?? 'plain/text',
      disposition: 'attachment'
    });
  }
  return attachMail;
}

export {
  AppMailer
};