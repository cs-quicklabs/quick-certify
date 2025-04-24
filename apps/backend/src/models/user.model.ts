import { Column, Table, DataType, Index } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Exclude, Expose } from 'class-transformer';

@Table({
  tableName: 'users',
})
export class UserModel extends BaseModel {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    unique: true,
  })
  @Index
  uuid: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.VIRTUAL,
  })
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @Exclude()
  password: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  inActiveAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profileImageUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  emailAlertsOptIn: boolean;
}
