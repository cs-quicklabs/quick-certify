import { BeforeValidate, Column, DataType } from 'sequelize-typescript';
import { generateNanoid } from '@src/commons/utils/nanoid.util';
import { BaseEntity } from './base.entity';

/**
 * Base Nanoid Entity
 *
 * Extends BaseEntity (integer primary key) and adds a uuid column where we use nanoid
 * for external identification. Use this for entities that need:
 * - URL-safe public identifiers
 * - Protection against ID enumeration attacks
 * - Distributed system compatibility
 *
 * The integer `id` is used for internal references (foreign keys)
 * The string `uuid` is used for external references (URLs, APIs, etc.)
 */
export abstract class BaseNanoidEntity extends BaseEntity {
  @Column({
    type: DataType.STRING(21),
    primaryKey: true,
    allowNull: false,
  })
  declare uuid: string;

  @BeforeValidate
  static generateUUID(instance: BaseNanoidEntity): void {
    if (!instance.uuid) {
      instance.uuid = generateNanoid();
    }
  }
}

