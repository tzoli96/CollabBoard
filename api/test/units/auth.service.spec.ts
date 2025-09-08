import { Test } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { KeycloakService } from '../../src/keycloak/keycloak.service';
import { UsersRepository } from '../../src/database/repositories/users.repository';

const mockUsersRepo = () => ({ findWithTeams: jest.fn() });
const mockKeycloakService = () => ({ healthCheck: jest.fn(), isAdmin: jest.fn() });

describe('AuthService (unit)', () => {
  let service: AuthService;
  let usersRepo: jest.Mocked<UsersRepository>;
  let keycloak: jest.Mocked<KeycloakService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepo() },
        { provide: KeycloakService, useValue: mockKeycloakService() },
      ],
    }).compile();

    service = module.get(AuthService);
    usersRepo = module.get(UsersRepository) as any;
    keycloak = module.get(KeycloakService) as any;
  });

  it('getUserProfile() returns enriched profile with teams and isAdmin', async () => {
    (usersRepo.findWithTeams as any).mockResolvedValueOnce({ teamMemberships: [{ id: 'm1' }] });
    (keycloak.isAdmin as any).mockReturnValueOnce(true);

    const profile = await service.getUserProfile({
      id: 'u1', keycloakId: 'k1', email: 'a@b.com', firstName: 'A', lastName: 'B', roles: ['admin'], isActive: true,
    });

    expect(usersRepo.findWithTeams).toHaveBeenCalledWith('u1');
    expect(profile).toMatchObject({
      id: 'u1', email: 'a@b.com', fullName: 'A B', isAdmin: true, teams: [{ id: 'm1' }],
    });
  });

  it('healthCheck() reflects keycloak status and database true', async () => {
    (keycloak.healthCheck as any).mockResolvedValueOnce(true);
    const res = await service.healthCheck();
    expect(res).toEqual({ keycloak: true, database: true });
  });
});
