import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blogs } from './blogs.entity';

@Entity("BanUsersBlogs")
export class BanUsersBlogs {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column({nullable: true})
    login: string

    @Column({default: false, nullable: true})
    isBanned: boolean

    @Column({nullable: true})
    banDate: string

    @Column({nullable: true})
    banReason: string

    @ManyToOne (() => Blogs, { onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    blog: Blogs
}
