import { ApiProperty } from '@nestjs/swagger';

export class IResponse<T> {
  @ApiProperty()
  data: T;
  @ApiProperty()
  metadata?: {};
}

export class IResponseMessage {
  @ApiProperty()
  message: string;
  @ApiProperty()
  status: number;
  @ApiProperty()
  metadata?: {};
}

export class IResponseMessageWithData extends IResponseMessage {
  @ApiProperty()
  data?: {};
}
