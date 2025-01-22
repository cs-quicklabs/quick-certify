import { Column, Model, Table, HasMany, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier',
  })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({
    example: 'John',
    description: 'User\'s first name',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User\'s last name',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User\'s email address',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  email: string;

  @ApiProperty({
    example: 'hashedPassword123',
    description: 'User\'s hashed password',
    writeOnly: true, // This indicates the property is write-only and shouldn't be returned in responses
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  // You might want to add these fields in the response but exclude password
  @ApiProperty({
    example: '2024-01-03T12:00:00Z',
    description: 'Timestamp of when the user was created',
  })
  declare createdAt: Date;

  @ApiProperty({
    example: '2024-01-03T12:00:00Z',
    description: 'Timestamp of when the user was last updated',
  })
  declare updatedAt: Date;
}