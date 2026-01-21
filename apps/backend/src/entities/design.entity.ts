import { Column, DataType, Table } from "sequelize-typescript";
import { BaseNanoidEntity } from "./base-nanoid.entity";

/**
 * Design Entity
 *
 * Design can either be for a Badge or a Certificate
 */

@Table({
  tableName: 'designs',
  underscored: true,
})
export class DesignEntity extends BaseNanoidEntity {
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  declare type: 'Certificate' | 'Badge';

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare url: string;
}
