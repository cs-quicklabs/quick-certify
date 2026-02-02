import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';
import { DesignLayout } from '@src/modules/design/interfaces/design.layout.interface';

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
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(15),
    allowNull: false,
  })
  declare type: 'certificate' | 'badge';

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare url: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare layout: DesignLayout | null;
}
