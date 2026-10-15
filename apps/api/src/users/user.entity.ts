import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('users')
@Unique('UQ_users_email', ['email'])
export class User {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'longtext' })
  name!: string;

  @Column({ type: 'varchar', length: 254, collation: 'utf8mb4_bin' })
  email!: string;

  @Column({ type: 'char', length: 32, select: false })
  salt!: string;

  @Column({ type: 'binary', length: 64, select: false })
  passwordHash!: Buffer;
}
