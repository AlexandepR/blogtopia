import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blogs } from '../../../blogs/domain/entities/blogs.entity';

@Entity('Users')
export class Users {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column({ collation: 'C' })
    login: string;

    @Column({ collation: 'C' })
    email: string;

    @Column({ type: 'timestamp with time zone' })
    created_at: Date;

    @Column({ default: ""})
    passwordHash: string;

    @Column({ default: false })
    isConfirmed: boolean;

    @Column({ default: ""})
    confirmationCode: string;

    @Column({ default: ""})
    expConfirmCodeDate: string;

    @Column({ default: ""})
    passRecoveryCode: string;

    @Column('date', { array: true, default: [] })
    sendEmails: string[];

    @Column('varchar', { array: true, default: [] })
    expRefreshToken: string[];

    @OneToMany(() => Blogs, (blog) => blog.user)
    blogs: Blogs[];
}