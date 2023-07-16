import { Types } from 'mongoose';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';
import { Posts } from '../../../posts/domain/entities/posts.entity';


@Entity('Comments')
export class Comments {
    @PrimaryGeneratedColumn('uuid')
    ID: string;

    @Column()
    @Length(20,300)
    content: string;

    @Column({ type: 'timestamp with time zone' })
    createdAt: string;

    @Column()
    commentatorId: string

    @Column()
    commentatorLogin: string

    @Column({default:0})
    likesCount: number;

    @Column({default:0})
    dislikesCount: number;

    @Column({default: "None"})
    myStatus: "None" | "Like" | "Dislike";

    @ManyToOne(() => Posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId', referencedColumnName: 'ID' })
    postId: Posts;
}

@Entity('CommentDislikesData')
export class CommentDislikesData {
    @PrimaryGeneratedColumn('uuid')
    ID: string

    @Column({ type: 'timestamp with time zone' })
    addedAt: Date

    @Column({nullable: true})
    userId: string

    @Column({nullable: true})
    login: string

    @ManyToOne(() => Comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'commentId', referencedColumnName: 'ID' })
    commentId: Comments;
}

@Entity('CommentLikesData')
export class CommentLikesData {
    @PrimaryGeneratedColumn('uuid')
    ID: string

    @Column({ type: 'timestamp with time zone' })
    addedAt: Date

    @Column({nullable: true})
    userId: string

    @Column({nullable: true})
    login: string

    @ManyToOne(() => Comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'commentId', referencedColumnName: 'ID' })
    commentId: Comments;
}