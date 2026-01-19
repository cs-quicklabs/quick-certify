import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';
import { DesignType } from '@src/commons/enums';

/**
 * Design Entity
 */

@Table({
  tableName: 'designs',
  underscored: true,
})
export class DesignEntity extends BaseNanoidEntity {
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string

  @Column({
    type: DataType.ENUM(...Object.values(DesignType)),
    allowNull: false,
    defaultValue: DesignType.CERTIFICATE,
  })
  declare design_type: DesignType;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare design_url: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deleted_at: Date | null;

}
