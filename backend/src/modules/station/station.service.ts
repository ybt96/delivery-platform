import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { StationDelivery } from './entities/station-delivery.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

/**
 * 服务站服务
 */
@Injectable()
export class StationService {
  constructor(
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(StationDelivery)
    private stationDeliveryRepository: Repository<StationDelivery>,
  ) {}

  /**
   * 申请成为服务站
   * @param createStationDto 服务站信息
   * @param userId 用户ID
   */
  async apply(createStationDto: CreateStationDto, userId: number) {
    // 检查用户是否已申请过服务站
    const existing = await this.stationRepository.findOne({
      where: { userId },
    });
    if (existing) {
      throw new ForbiddenException('您已提交过服务站申请');
    }

    // 创建服务站申请（待审核状态）
    const station = this.stationRepository.create({
      ...createStationDto,
      userId,
      status: 0, // 待审核状态
    });

    const saved = await this.stationRepository.save(station);

    return {
      code: 200,
      message: '服务站申请已提交，平台审核通过后即可运营',
      data: { id: saved.id, name: saved.name },
    };
  }

  /**
   * 获取附近服务站列表
   * @param latitude 纬度
   * @param longitude 经度
   */
  async getNearbyStations(latitude: number, longitude: number) {
    const stations = await this.stationRepository.find({
      where: { status: 1 }, // 只显示启用的服务站
      order: { createdAt: 'DESC' },
    });

    // 计算距离并排序
    const stationsWithDistance = stations.map((station) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        station.latitude,
        station.longitude,
      );
      return {
        ...station,
        distance,
      };
    });

    // 按距离排序，只显示距离小于10公里的
    const result = stationsWithDistance
      .filter((s) => s.distance < 10)
      .sort((a, b) => a.distance - b.distance);

    return {
      code: 200,
      data: result,
    };
  }

  /**
   * 获取服务站详情
   * @param id 服务站ID
   */
  async getStationDetail(id: number) {
    const station = await this.stationRepository.findOne({
      where: { id },
    });
    if (!station) {
      throw new NotFoundException('服务站不存在');
    }

    return {
      code: 200,
      data: station,
    };
  }

  /**
   * 站长创建代购订单
   * @param createPurchaseOrderDto 代购订单信息
   * @param userId 用户ID（站长）
   */
  async createPurchaseOrder(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    userId: number,
  ) {
    // 查找用户的服务站
    const station = await this.stationRepository.findOne({
      where: { userId, status: 1 },
    });
    if (!station) {
      throw new ForbiddenException('您还没有激活的服务站');
    }

    // 计算服务费（根据商品金额阶梯收费）
    const productPrice = Number(createPurchaseOrderDto.productPrice);
    const serviceFee = this.calculateServiceFee(productPrice);
    const deliveryFee =
      createPurchaseOrderDto.pickupMethod === 1 &&
      createPurchaseOrderDto.deliveryFee
        ? Number(createPurchaseOrderDto.deliveryFee)
        : 0;

    // 创建代购订单
    const order = this.purchaseOrderRepository.create({
      stationId: station.id,
      ...createPurchaseOrderDto,
      serviceFee,
      totalAmount: productPrice + serviceFee + deliveryFee,
      status: 0, // 待采购状态
      quantity: createPurchaseOrderDto.quantity || 1,
    });

    const saved = await this.purchaseOrderRepository.save(order);

    return {
      code: 200,
      message: '代购订单创建成功',
      data: saved,
    };
  }

  /**
   * 获取站长的代购订单列表
   * @param userId 用户ID（站长）
   * @param status 状态筛选
   */
  async getPurchaseOrders(userId: number, status?: number) {
    const station = await this.stationRepository.findOne({
      where: { userId },
    });
    if (!station) {
      throw new ForbiddenException('您还没有激活的服务站');
    }

    const where: any = { stationId: station.id };
    if (status !== undefined) {
      where.status = status;
    }

    const orders = await this.purchaseOrderRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return {
      code: 200,
      data: orders,
    };
  }

  /**
   * 获取代购订单详情
   * @param id 订单ID
   * @param userId 用户ID（站长）
   */
  async getPurchaseOrderDetail(id: number, userId: number) {
    const station = await this.stationRepository.findOne({
      where: { userId },
    });
    if (!station) {
      throw new ForbiddenException('您还没有激活的服务站');
    }

    const order = await this.purchaseOrderRepository.findOne({
      where: { id, stationId: station.id },
    });
    if (!order) {
      throw new NotFoundException('订单不存在或无权访问');
    }

    return {
      code: 200,
      data: order,
    };
  }

  /**
   * 计算两点之间的距离（单位：公里）
   * 使用 Haversine 公式
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 将角度转换为弧度
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 计算代购服务费
   * @param productAmount 商品金额
   */
  private calculateServiceFee(productAmount: number): number {
    // 服务费规则：
    // ¥0 ~ ¥50: ¥3.00
    // ¥50 ~ ¥200: ¥5.00
    // ¥200 ~ ¥500: ¥10.00
    // ¥500 以上: 商品金额的 2%（最高不超过 ¥50）

    if (productAmount <= 50) {
      return 3.0;
    } else if (productAmount <= 200) {
      return 5.0;
    } else if (productAmount <= 500) {
      return 10.0;
    } else {
      const fee = productAmount * 0.02;
      return fee > 50 ? 50 : fee;
    }
  }
}