import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';


@Entity()
export class BanUserInfo {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column({ default: false })
    isBanned: boolean;

    @Column({ type: 'timestamp with time zone', nullable: true })
    banDate: Date;

    @Column({ default: '', nullable: true })
    banReason: string;

    @OneToOne(() => Users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: Users;
}