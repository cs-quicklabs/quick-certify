import { Column, Table, DataType, Index } from 'sequelize-typescript';
import { BaseModel } from './base.model';

@Table({
  tableName: 'organizations',
})
export class OrganizationModel extends BaseModel {
  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  @Index
  slug: string;

  @Column({
    type: DataType.STRING,
  })
  linkedIdUrl: string;

  @Column({
    type: DataType.STRING,
  })
  facebookUrl: string;

  @Column({
    type: DataType.STRING,
  })
  twitterUrl: string;

  @Column({
    type: DataType.STRING,
  })
  websiteUrl: string;
}
