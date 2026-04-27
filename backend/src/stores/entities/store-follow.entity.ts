import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Store } from './store.entity';

@Entity('store_follows')
@Unique(['customerId', 'storeId'])
export class StoreFollow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => Store, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column()
  storeId: string;

  @CreateDateColumn()
  createdAt: Date;
}
