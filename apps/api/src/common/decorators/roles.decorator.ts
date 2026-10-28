import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Uso: @Roles('admin') em cima de uma rota. Guarda metadata que o
// RolesGuard lê depois — não faz checagem nenhuma sozinho.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
