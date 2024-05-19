import { User } from '@user/entity/user.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUserRecord1652254661781 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepo = queryRunner.manager.getRepository(User);

    const user = userRepo.create({
      email: 'local@test.com',
      firstName: 'Local',
      lastName: 'User',
      password: 'Test@12345',
    });

    await userRepo.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
