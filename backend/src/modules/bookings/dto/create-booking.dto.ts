import { IsUUID, IsNumber, IsDate, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingFeeType } from '../../../shared/enums';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  unitId: string;

  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 2700000 })
  @IsNumber()
  @Min(1)
  netPrice: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  discountPct?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  bookingFee: number;

  @ApiProperty({ enum: BookingFeeType, example: BookingFeeType.DEDUCTED_FROM_FIRST })
  @IsEnum(BookingFeeType)
  bookingFeeType: BookingFeeType;

  @ApiProperty({ example: '2026-03-01T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  validUntil: Date;
}
