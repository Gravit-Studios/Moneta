import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  // Exportação completa dos dados pessoais (direito de portabilidade da LGPD).
  // Nunca inclui passwordHash nem tokens — só os dados financeiros do próprio usuário.
  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        categories: true,
        incomes: true,
        expenses: true,
        recurringBills: true,
        installments: true,
        cards: true,
        goals: true,
        alerts: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  // Exclusão de conta (direito ao esquecimento). Cascateia via Prisma/Postgres
  // para todas as tabelas de domínio — ver onDelete: Cascade no schema.
  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
