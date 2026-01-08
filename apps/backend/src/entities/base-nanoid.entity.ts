import { BeforeValidate, Column, CreatedAt, DataType, Model, UpdatedAt } from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { generateNanoid } from '@src/commons/utils/nanoid.util';

/**
 * Base Nanoid Entity
 *
 * Base class for entities using nanoid as primary key
 * Uses @BeforeValidate to generate ID before validation runs
 */
export abstract class BaseNanoidEntity extends Model<Record<string, unknown>> {
  @Column({
    type: DataType.STRING(21),
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @BeforeValidate
  static generateId(instance: BaseNanoidEntity): void {
    if (!instance.id) {
      instance.id = generateNanoid();
    }
  }

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('NOW()'),
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('NOW()'),
  })
  declare updatedAt: Date;

  override toJSON() {
    return this.get({ plain: true });
  }
}

