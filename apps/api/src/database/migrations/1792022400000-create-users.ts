import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateUsers1792022400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'char', length: '36', isPrimary: true },
        { name: 'name', type: 'longtext' },
        { name: 'email', type: 'varchar', length: '254', collation: 'utf8mb4_bin' },
        { name: 'salt', type: 'char', length: '32' },
        { name: 'passwordHash', type: 'binary', length: '64' },
      ],
      uniques: [{ name: 'UQ_users_email', columnNames: ['email'] }],
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
