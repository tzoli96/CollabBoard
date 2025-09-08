import { Test } from '@nestjs/testing';
import { ProjectsService } from '../../src/projects/projects.service';
import { PrismaService } from '../../src/database/prisma.service';

function mockPrisma() {
  return {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      create: jest.fn(),
    },
  } as any as PrismaService;
}

describe('ProjectsService (unit)', () => {
  let service: ProjectsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrisma() },
      ],
    }).compile();

    service = module.get(ProjectsService);
    prisma = module.get(PrismaService) as any;
  });

  it('list() should filter by teamId when provided', async () => {
    (prisma.project.findMany as any).mockResolvedValueOnce([{ id: 'p1' }]);
    const res = await service.list('t1');
    expect(prisma.project.findMany).toHaveBeenCalledWith({ where: { teamId: 't1' }, orderBy: { createdAt: 'desc' } });
    expect(res).toEqual([{ id: 'p1' }]);
  });

  it('getById() should include team', async () => {
    (prisma.project.findUnique as any).mockResolvedValueOnce({ id: 'p1' });
    const res = await service.getById('p1');
    expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'p1' }, include: { team: true } });
    expect(res).toEqual({ id: 'p1' });
  });

  it('create() should create project and log activity', async () => {
    (prisma.project.create as any).mockResolvedValueOnce({ id: 'p1', teamId: 't1' });
    const res = await service.create('u1', { title: 'X', teamId: 't1' } as any);
    expect(prisma.project.create).toHaveBeenCalled();
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'PROJECT_CREATED', teamId: 't1', projectId: 'p1', payload: { title: 'X' } } });
    expect(res).toEqual({ id: 'p1', teamId: 't1' });
  });

  it('update() should update and log', async () => {
    (prisma.project.update as any).mockResolvedValueOnce({ id: 'p1', teamId: 't1' });
    const res = await service.update('u1', 'p1', { title: 'Y' } as any);
    expect(prisma.project.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { title: 'Y' } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'PROJECT_UPDATED', teamId: 't1', projectId: 'p1' } });
    expect(res).toEqual({ id: 'p1', teamId: 't1' });
  });

  it('remove() should delete and log', async () => {
    (prisma.project.delete as any).mockResolvedValueOnce({ id: 'p1', teamId: 't1' });
    const res = await service.remove('u1', 'p1');
    expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(prisma.activity.create).toHaveBeenCalledWith({ data: { actorUserId: 'u1', type: 'PROJECT_DELETED', teamId: 't1', projectId: 'p1' } });
    expect(res).toEqual({ ok: true });
  });
});
