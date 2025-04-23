import { instanceToPlain } from 'class-transformer';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  underscored: true,
})
export class BaseModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  toJSON() {
    return instanceToPlain(this);
  }
}
