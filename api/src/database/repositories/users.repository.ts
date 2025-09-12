
import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { PrismaService } from '../prisma.service';

// Complex types with relations
export type UserWithTeams = Prisma.UserGetPayload<{
    include: {
        teamMemberships: {
            include: { team: true }
        }
    }
}>;

@Injectable()
export class UsersRepository extends BaseRepository {
    constructor(prisma: PrismaService) {
        super(prisma, UsersRepository.name);
    }

    // ==============================================
    // BASIC CRUD Operations
    // ==============================================

    async findMany(): Promise<User[]> {
        try {
            return await this.prisma.user.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            this.handleError(error, 'findMany');
        }
    }

    async findById(id: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({
                where: { id },
            });
        } catch (error) {
            this.handleError(error, 'findById');
        }
    }

    async findByKeycloakId(keycloakId: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({
                where: { keycloakId },
            });
        } catch (error) {
            this.handleError(error, 'findByKeycloakId');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({
                where: { email },
            });
        } catch (error) {
            this.handleError(error, 'findByEmail');
        }
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        try {
            const user = await this.prisma.user.create({ data });
            this.logger.log(`User created: ${user.email}`);
            return user;
        } catch (error) {
            this.handleError(error, 'create');
        }
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data,
            });
            this.logger.log(`User updated: ${user.email}`);
            return user;
        } catch (error) {
            this.handleError(error, 'update');
        }
    }

    // ==============================================
    // BUSINESS LOGIC Methods
    // ==============================================

    async syncFromKeycloak(keycloakData: {
        keycloakId: string;
        email: string;
        firstName: string;
        lastName: string;
        roles: string[]; // ✨ ÚJ: Keycloak role-ok
    }): Promise<User> {
        try {
            // Email alapú upsert használata a keycloak_id helyett
            const user = await this.prisma.user.upsert({
                where: { email: keycloakData.email },
                update: {
                    keycloakId: keycloakData.keycloakId,
                    firstName: keycloakData.firstName,
                    lastName: keycloakData.lastName,
                    roles: keycloakData.roles, // ✨ Role-ok mentése
                    rolesUpdatedAt: new Date(), // ✨ Szinkronizáció időpontja
                    updatedAt: new Date(),
                },
                create: {
                    keycloakId: keycloakData.keycloakId,
                    email: keycloakData.email,
                    firstName: keycloakData.firstName,
                    lastName: keycloakData.lastName,
                    roles: keycloakData.roles, // ✨ Role-ok mentése
                    rolesUpdatedAt: new Date(), // ✨ Szinkronizáció időpontja
                    isActive: true,
                },
            });

            this.logger.log(`User synced from Keycloak: ${user.email} with roles: ${keycloakData.roles.join(', ')}`);
            return user;
        } catch (error) {
            this.handleError(error, 'syncFromKeycloak');
        }
    }

    async findWithTeams(userId: string): Promise<UserWithTeams | null> {
        try {
            return await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    teamMemberships: {
                        include: { team: true }
                    }
                }
            });
        } catch (error) {
            this.handleError(error, 'findWithTeams');
        }
    }
}