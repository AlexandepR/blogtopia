import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Length, Matches, MaxLength } from 'class-validator';
import { Users } from '../../../users/domain/entities/user.entity';


@Entity('Blogs')
export class Blogs {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column()
    @MaxLength(15)
    name: string

    @Column()
    @MaxLength(500)
    description: string

    @Column()
    @MaxLength(100)
    @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    websiteUrl: string

    // @Column()
    // BlogOwnerId: string

    @Column()
    BlogOwnerLogin: string

    @Column({default: false})
    isMembership: boolean

    @Column({default: false})
    isBanned: false

    @Column({ type: 'timestamp with time zone', nullable: true })
    banDate: Date

    @ManyToOne(() => Users, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'BlogOwnerId'})
    user: Users
}
