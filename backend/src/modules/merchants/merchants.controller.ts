import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

@ApiTags('商家管理')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @ApiOperation({ summary: '创建商家' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: '商家创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMerchantDto: CreateMerchantDto) {
    try {
      const merchant = await this.merchantsService.create(createMerchantDto);
      return {
        message: '商家创建成功',
        data: merchant,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: '获取所有商家' })
  @ApiResponse({ status: 200, description: '获取商家列表成功' })
  @Get()
  async findAll() {
    const merchants = await this.merchantsService.findAll();
    return {
      message: '获取商家列表成功',
      data: merchants,
    };
  }

  @ApiOperation({ summary: '根据ID获取商家' })
  @ApiResponse({ status: 200, description: '获取商家信息成功' })
  @ApiResponse({ status: 404, description: '商家不存在' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const merchant = await this.merchantsService.findOne(id);
    return {
      message: '获取商家信息成功',
      data: merchant,
    };
  }

  @ApiOperation({ summary: '根据用户ID获取商家' })
  @ApiResponse({ status: 200, description: '获取商家信息成功' })
  @ApiResponse({ status: 404, description: '商家不存在' })
  @Get('user/:userId')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const merchant = await this.merchantsService.findByUserId(userId);
    return {
      message: '获取商家信息成功',
      data: merchant,
    };
  }

  @ApiOperation({ summary: '更新商家信息' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '商家信息更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '商家不存在' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    try {
      const merchant = await this.merchantsService.update(id, updateMerchantDto);
      return {
        message: '商家信息更新成功',
        data: merchant,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: '删除商家' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '商家删除成功' })
  @ApiResponse({ status: 404, description: '商家不存在' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.merchantsService.remove(id);
      return {
        message: '商家删除成功',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: '根据状态获取商家列表' })
  @ApiResponse({ status: 200, description: '获取商家列表成功' })
  @Get('status/:status')
  async findByStatus(@Param('status', ParseIntPipe) status: number) {
    const merchants = await this.merchantsService.findByStatus(status);
    return {
      message: '获取商家列表成功',
      data: merchants,
    };
  }
}