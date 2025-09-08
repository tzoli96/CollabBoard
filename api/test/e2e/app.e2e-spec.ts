import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

// We will only call public endpoints here to avoid dealing with Keycloak in e2e.

describe('App e2e (public endpoints)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) should return hello', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(typeof res.text === 'string' || typeof res.body === 'string').toBeTruthy();
  });

  it('/health (GET) should return ok status', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('/auth/health (GET) should return ok status', async () => {
    const res = await request(app.getHttpServer()).get('/auth/health').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('auth');
  });
});
