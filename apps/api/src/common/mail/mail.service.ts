import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.fromAddress = this.config.get<string>('MAIL_FROM', 'Moneta <noreply@moneta.app>');
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Recuperação de senha — Moneta',
      html: `<p>Recebemos um pedido para redefinir sua senha.</p>
             <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a>. O link expira em 30 minutos.</p>
             <p>Se você não pediu isso, ignore este e-mail.</p>`,
    });

    if (error) {
      this.logger.error(`Falha ao enviar e-mail de recuperação de senha: ${error.message}`);
      throw new Error('Não foi possível enviar o e-mail de recuperação de senha.');
    }
  }
}
