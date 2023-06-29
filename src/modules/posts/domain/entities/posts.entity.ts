import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../../users/domain/entities/user.entity';

type NewestLikesKey = "description" | "addedAt" | "userId" | "login";

@Entity('Posts')
export class Posts {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column()
    title: string;

    @Column()
    shortDescription: string;

    @Column()
    content: string;

    @Column()
    blogId: string;

    @Column()
    blogName: string;

    @Column({ type: 'timestamp with time zone' })
    createdAt: string;

    @Column()
    PostOwnerLogin: string;

    @Column()
    likesCount: number;

    @Column()
    dislikesCount: number;

    @Column({default: "None"})
    myStatus: "None" | "Like" | "Dislike";

    @Column({nullable: true})
    newestLikes: Record<NewestLikesKey, string>[];

    @ManyToOne(() => Users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'PostOwnerId', referencedColumnName: 'ID' })
    userId: Users;

    // @ManyToOne(() => Users, {onDelete: 'CASCADE'})
    // @JoinColumn({name: 'PostOwnerLogin', referencedColumnName: 'login' })
    // login: Users
}

@Entity('PostLikesData')
export class PostLikesData {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column({ type: 'timestamp with time zone' })
    addedAt: Date

    @Column({nullable: true})
    userId: string

    @Column({nullable: true})
    login: string

    @ManyToOne(() => Posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId', referencedColumnName: 'ID' })
    postId: Posts;

}

@Entity('PostDislikesData')
export class PostDislikesData {
    @PrimaryGeneratedColumn('uuid')
    ID: string

    @Column({ type: 'timestamp with time zone' })
    addedAt: Date

    @Column({nullable: true})
    userId: string

    @Column({nullable: true})
    login: string

    @ManyToOne(() => Posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId', referencedColumnName: 'ID' })
    postId: Posts;

}