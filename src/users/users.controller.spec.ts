import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('/users', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findFirst: (it) => it,
          },
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  it('/me should take user id from token', async () => {
    const request = { user: { id: 12 } } as any;
    const res = await controller.findMe(request);
    expect(res).toEqual({ id: 12 });
  });
});
