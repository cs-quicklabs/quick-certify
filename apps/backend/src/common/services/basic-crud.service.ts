import {
  Model,
  ModelStatic,
  FindOptions,
  CreateOptions,
  CreationAttributes,
  Identifier,
} from 'sequelize';

/**
 * A basic CRUD service for performing common database operations using Sequelize.
 * @template T - The Sequelize Model instance type.
 */
export class BasicCrudService<T extends Model> {
  options: FindOptions;

  constructor(protected model: ModelStatic<T>, options: FindOptions = {}) {
    this.options = Object.assign({}, options);
  }

  /**
   * Retrieves all records matching the given options.
   */
  async getAll(options: FindOptions<T> = {}) {
    return this.model.findAll(Object.assign({}, this.options, options));
  }

  /**
   * Retrieves a single record by its primary key.
   */
  async getOneByPk(identifier: Identifier, options: FindOptions<T> = {}) {
    return this.model.findByPk(
      identifier,
      Object.assign({}, this.options, options)
    );
  }

  /**
   * Retrieves a single record matching the given options.
   */
  async getOne(options: FindOptions<T> = {}) {
    return this.model.findOne(Object.assign({}, this.options, options));
  }

  /**
   * Creates a new record with the provided payload.
   * - `Attributes<M>` extracts the full attribute set of the model.
   */
  async create(payload: CreationAttributes<T>, options: CreateOptions = {}) {
    return this.model.create(payload, Object.assign({}, this.options, options));
  }
}
