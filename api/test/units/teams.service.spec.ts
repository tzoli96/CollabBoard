import { Test } from '@nestjs/testing';
import { TeamsService } from '../../src/teams/teams.service';
import { PrismaService } from '../../src/database/prisma.service';

function mockPrisma() {
  return {
    team: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teamMember: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      create: jest.fn(),
    },
  } as any as PrismaService;
}

describe('TeamsService (unit)', () => {
  let service: TeamsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: PrismaService, useValue: mockPrisma() },
      ],
    }).compile();

    service = module.get(TeamsService);
    prisma = module.get(PrismaService) as any;
  });

  it('list() should return teams ordered by createdAt desc', async () => {
    (prisma.team.findMany as any).mockResolvedValueOnce([{ id: 't1' }]);
    const res = await service.list();
    expect(prisma.team.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
    expect(res).toEqual([{ id: 't1' }]);
  });

  it('getById() should include members with user and projects', async () => {
    (prisma.team.findUnique as any).mockResolvedValueOnce({ id: 't1' });
    const res = await service.getById('t1');
    expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { id: 't1' }, include: { members: { include: { user: true } }, projects: true } });
    expect(res).toEqual({ id: 't1' });
  });

  it('create() should create team, add creator as ADMIN and log activity', async () => {
    (prisma.team.create as any).mockResolvedValueOnce({ id: 't1', name: 'Dev' });
    (prisma.teamMember.create as any).mockResolvedValueOnce({});
    (prisma.activity.create as any).mockResolvedValueOnce({});

    const res = await service.create('u1', { name: 'Dev', description: 'd' });

    expect(prisma.team.create).toHaveBeenCalledWith({ data: { name: 'Dev', description: 'd', createdBy: 'u1' } });
    expect(prisma.teamMember.create).toHaveBeenCalledWith({ data: { teamId: 't1', userId: 'u1', role: 'ADMIN' } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'TEAM_CREATED', payload: { teamId: 't1', name: 'Dev' } } });
    expect(res).toEqual({ id: 't1', name: 'Dev' });
  });

  it('update() should update team and log activity', async () => {
    (prisma.team.update as any).mockResolvedValueOnce({ id: 't1', name: 'New' });
    const res = await service.update('u1', 't1', { name: 'New' });
    expect(prisma.team.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { name: 'New' } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'TEAM_UPDATED', payload: { teamId: 't1' } } });
    expect(res).toEqual({ id: 't1', name: 'New' });
  });

  it('remove() should delete team and log activity', async () => {
    (prisma.team.delete as any).mockResolvedValueOnce({ id: 't1' });
    const res = await service.remove('u1', 't1');
    expect(prisma.team.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'TEAM_DELETED', payload: { teamId: 't1' } } });
    expect(res).toEqual({ ok: true });
  });

  it('listMembers() should fetch team members with user', async () => {
    (prisma.teamMember.findMany as any).mockResolvedValueOnce([{ id: 'm1' }]);
    const res = await service.listMembers('t1');
    expect(prisma.teamMember.findMany).toHaveBeenCalledWith({ where: { teamId: 't1' }, include: { user: true } });
    expect(res).toEqual([{ id: 'm1' }]);
  });

  it('addMember() should create membership and log activity', async () => {
    (prisma.teamMember.create as any).mockResolvedValueOnce({ id: 'm1' });
    const res = await service.addMember('u1', 't1', { userId: 'u2' });
    expect(prisma.teamMember.create).toHaveBeenCalledWith({ data: { teamId: 't1', userId: 'u2', role: 'MEMBER' } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'TEAM_MEMBER_ADDED', payload: { teamId: 't1', userId: 'u2', role: 'MEMBER' } } });
    expect(res).toEqual({ id: 'm1' });
  });

  it('updateMemberRole() should update and log', async () => {
    (prisma.teamMember.update as any).mockResolvedValueOnce({ id: 'm1', role: 'ADMIN' });
    const res = await service.updateMemberRole('u1', 't1', 'u2', { role: 'ADMIN' as any });
    expect(prisma.teamMember.update).toHaveBeenCalledWith({ where: { userId_teamId: { userId: 'u2', teamId: 't1' } }, data: { role: 'ADMIN' } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'TEAM_MEMBER_ROLE_UPDATED', payload: { teamId: 't1', userId: 'u2', role: 'ADMIN' } } });
    expect(res).toEqual({ id: 'm1', role: 'ADMIN' });
  });

  it('removeMember() should delete and log', async () => {
    (prisma.teamMember.delete as any).mockResolvedValueOnce({});
    const res = await service.removeMember('u1', 't1', 'u2');
    expect(prisma.teamMember.delete).toHaveBeenCalledWith({ where: { userId_teamId: { userId: 'u2', teamId: 't1' } } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'TEAM_MEMBER_REMOVED', payload: { teamId: 't1', userId: 'u2' } } });
    expect(res).toEqual({ ok: true });
  });
});
