import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column({ type: 'varchar' })
    login: string;

    @Column({ type: 'varchar' })
    email: string;

    @Column({ type: 'timestamp with time zone', nullable: true })
    created_at: Date;

    @Column({ type: 'varchar' })
    passwordHash: string;

    @Column({ type: 'boolean' })
    isConfirmed: boolean;

    @Column({ type: 'varchar' })
    confirmationCode: string;

    @Column({ type: 'varchar' })
    expConfirmCodeDate: string;

    @Column({ type: 'varchar' })
    passRecoveryCode: string;

    @Column({ type: 'date', array: true })
    sendEmails: string[];

    @Column({ type: 'varchar', nullable: true })
    expRefreshToken: string;
}