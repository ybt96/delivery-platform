import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

/**
 * 商品控制器
 */
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 创建商品（商家）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * 获取商品列表
   */
  @Get()
  findAndCount(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('categoryId') categoryId?: number,
    @Query('merchantId') merchantId?: number,
  ) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (merchantId) where.merchantId = merchantId;
    return this.productsService.findAndCount({ skip, take, where });
  }

  /**
   * 获取商品详情
   * @param id 商品ID
   */
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * 更新商品（商家）
   * @param id 商品ID
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * 删除商品（商家）
   * @param id 商品ID
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }

  /**
   * 搜索商品
   */
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.productsService.search(keyword);
  }
}