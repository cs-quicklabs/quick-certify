# Base CRUD Abstractions

Reusable base classes and interfaces for CRUD operations with pagination, soft delete, and multi-tenant support.

## 📁 Structure

```
base/
├── interfaces/
│   └── base-crud.interface.ts   # Interfaces for CRUD operations
├── dtos/
│   └── pagination.dto.ts        # Pagination query parameters
├── base-crud.service.ts         # Abstract CRUD service
└── index.ts
```

## 🚀 Usage

### 1. Create Your Entity

```typescript
// entities/product.entity.ts
import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';

@Table({ tableName: 'product' })
export class ProductEntity extends BaseEntity {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare uuid: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: number;

  @ForeignKey(() => OrganizationEntity)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare organization_id: number;

  @Column({ type: DataType.DATE, allowNull: true })
  declare deleted_at: Date | null;
}
```

### 2. Create DTOs

```typescript
// modules/product/dtos/create-product.dto.ts
export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  organizationId: number;
}

// modules/product/dtos/update-product.dto.ts
export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}
```

### 3. Create Your Service

```typescript
// modules/product/product.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseCrudService } from '@src/commons/base';
import { ProductEntity } from '@src/entities';
import { CreateProductDto, UpdateProductDto } from './dtos';

@Injectable()
export class ProductService extends BaseCrudService<
  ProductEntity,
  CreateProductDto,
  UpdateProductDto
> {
  // Required: specify the model
  protected readonly model = ProductEntity;

  // Required: entity name for error messages
  protected readonly entityName = 'Product';

  // Optional: customize defaults
  protected readonly defaultSortField = 'createdAt';
  protected readonly defaultSortOrder: 'ASC' | 'DESC' = 'DESC';
  protected readonly defaultLimit = 20;
  protected readonly maxLimit = 100;

  constructor(
    @InjectModel(ProductEntity)
    private productModel: typeof ProductEntity,
  ) {
    super();
  }

  // Override create to add custom logic
  async create(dto: CreateProductDto): Promise<ProductEntity> {
    // Custom logic here...
    return this.productModel.create({
      name: dto.name,
      price: dto.price,
      organization_id: dto.organizationId,
    });
  }

  // Override update to add custom logic
  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.findOneOrFail(id);
    await product.update(dto);
    return product;
  }
}
```

### 4. Use in Controller

```typescript
// modules/product/product.controller.ts
import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ProductService } from './product.service';
import { PaginationDto } from '@src/commons/base/dtos';
import { CurrentUser } from '@src/modules/auth/decorators';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@CurrentUser('organizationId') orgId: number, @Query() pagination: PaginationDto) {
    return this.productService.findAllByOrganization(orgId, pagination);
  }

  @Get(':id')
  async findOne(@CurrentUser('organizationId') orgId: number, @Param('id') id: number) {
    return this.productService.findOneByOrganizationOrFail(id, orgId);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.productService.softDelete(id);
  }
}
```

## 📖 Available Methods

### Basic CRUD

| Method                    | Description                            |
| ------------------------- | -------------------------------------- |
| `findAll(options)`        | Get paginated list                     |
| `findOne(id)`             | Find by ID (returns null if not found) |
| `findOneOrFail(id)`       | Find by ID (throws if not found)       |
| `findByUuid(uuid)`        | Find by UUID                           |
| `findByUuidOrFail(uuid)`  | Find by UUID (throws if not found)     |
| `create(dto)`             | Create new record                      |
| `update(id, dto)`         | Update record                          |
| `updateByUuid(uuid, dto)` | Update by UUID                         |
| `delete(id)`              | Hard delete                            |
| `softDelete(id)`          | Soft delete (sets deleted_at)          |
| `restore(id)`             | Restore soft-deleted record            |

### Utility Methods

| Method               | Description          |
| -------------------- | -------------------- |
| `count(where)`       | Count records        |
| `exists(id)`         | Check if ID exists   |
| `existsByUuid(uuid)` | Check if UUID exists |

### Multi-Tenant Methods

| Method                                   | Description                             |
| ---------------------------------------- | --------------------------------------- |
| `findAllByOrganization(orgId, options)`  | Get paginated list for organization     |
| `findOneByOrganization(id, orgId)`       | Find by ID within organization          |
| `findOneByOrganizationOrFail(id, orgId)` | Find by ID within organization (throws) |

## 📊 Pagination

### PaginationDto

```typescript
class PaginationDto {
  page?: number = 1; // Page number (1-based)
  limit?: number = 10; // Items per page (max 100)
  sortBy?: string; // Field to sort by
  sortOrder?: 'ASC' | 'DESC'; // Sort direction
  search?: string; // Search query (implement in service)
}
```

### PaginatedResult

```typescript
interface PaginatedResult<T> {
  data: T[]; // Array of items
  meta: {
    total: number; // Total items count
    page: number; // Current page
    limit: number; // Items per page
    totalPages: number; // Total pages
    hasNextPage: boolean; // Has next page
    hasPrevPage: boolean; // Has previous page
  };
}
```

### Usage

```typescript
// GET /products?page=2&limit=20&sortBy=price&sortOrder=ASC

@Get()
async findAll(@Query() pagination: PaginationDto) {
  const result = await this.productService.findAll(pagination);

  // result = {
  //   data: [...products],
  //   meta: {
  //     total: 150,
  //     page: 2,
  //     limit: 20,
  //     totalPages: 8,
  //     hasNextPage: true,
  //     hasPrevPage: true
  //   }
  // }
}
```

## 🔧 Customization

### Override Defaults

```typescript
@Injectable()
export class ProductService extends BaseCrudService<...> {
  // Change default sort field
  protected readonly defaultSortField = 'name';

  // Change default sort order
  protected readonly defaultSortOrder: 'ASC' | 'DESC' = 'ASC';

  // Change default page size
  protected readonly defaultLimit = 25;

  // Change maximum page size
  protected readonly maxLimit = 200;

  // Change soft delete field name (default: 'deleted_at')
  protected readonly softDeleteField = 'deletedAt';
}
```

### Add Custom Methods

```typescript
@Injectable()
export class ProductService extends BaseCrudService<...> {

  // Add search functionality
  async search(query: string, orgId: number) {
    return this.findAll({
      where: {
        organization_id: orgId,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });
  }

  // Add custom business logic
  async findFeatured(orgId: number) {
    return this.model.findAll({
      where: {
        organization_id: orgId,
        is_featured: true,
        deleted_at: null,
      },
    });
  }
}
```

## 🎯 FindAllOptions

```typescript
interface FindAllOptions {
  page?: number; // Page number
  limit?: number; // Items per page
  sortBy?: string; // Sort field
  sortOrder?: 'ASC' | 'DESC'; // Sort direction
  where?: Record<string, any>; // Sequelize where clause
  include?: any[]; // Sequelize includes
  attributes?: string[]; // Fields to select
}
```

### Usage with Options

```typescript
// With custom where clause
const activeProducts = await this.productService.findAll({
  where: { is_active: true },
  sortBy: 'price',
  sortOrder: 'ASC',
});

// With includes
const productsWithCategory = await this.productService.findAll({
  include: [{ model: CategoryEntity }],
});

// With specific attributes
const productNames = await this.productService.findAll({
  attributes: ['id', 'name'],
});
```

## ⚠️ Important Notes

1. **Soft Delete**: By default, all find methods exclude soft-deleted records
2. **Multi-Tenant**: Use `findAllByOrganization` and `findOneByOrganization` for tenant isolation
3. **Override Methods**: Override `create` and `update` in your service for custom logic
4. **Protected Model**: Access the model via `this.model` in your service
