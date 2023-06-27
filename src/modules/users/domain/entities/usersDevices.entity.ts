import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';

@Entity()
export class UsersDevicesSessions {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column({ default: ''})
    ip: string;

    @Column({ default: ''})
    deviceId: string;

    @Column({ default: ''})
    title: string;

    @Column({ default: ''})
    lastActiveDate: string;

    @ManyToOne(() => Users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: Users;
}