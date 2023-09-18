import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blogs } from "../../../blogs/domain/entities/blogs.entity";
import { BanUserInfo } from "./banUser.entity";
import { UsersDevicesSessions } from "./usersDevices.entity";

@Entity("Users")
export class Users {

  @PrimaryGeneratedColumn("uuid")
  ID: string;

  @Column({
    type: "character varying",
    length: 15,
    collation: "C"
  })
  login: string;

  @Column({
    type: "varchar",
    collation: "C"
  })
  email: string;

  // @Column({ type: "varchar" })
  @Column({ default: new Date(), type: "timestamp with time zone" })
  createdAt: Date;
  // createdAt: string;

  @Column({ default: "" })
  passwordHash: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ default: "" })
  confirmationCode: string;

  @Column({ default: null })
  expConfirmCodeDate: Date;

  @Column({ default: "" })
  passRecoveryCode: string;

  @Column("date", { array: true, default: [] })
  sendEmails: string[];

  @Column("varchar", { array: true, default: [] })
  expRefreshToken: string[];

  @OneToMany(() => Blogs, (blog) => blog.user)
  blogs: Blogs[];
  @OneToOne(() => BanUserInfo, banInfo => banInfo.user)
  banInfo: BanUserInfo;
  @OneToMany(() => UsersDevicesSessions, devicesSessions => devicesSessions.user)
  devicesSessions: UsersDevicesSessions[];
}