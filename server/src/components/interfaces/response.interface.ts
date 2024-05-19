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
<<<<<<< HEAD
  @ApiProperty()
  metadata?: {};
}

export class IResponseMessageWithData extends IResponseMessage {
  @ApiProperty()
  data?: {};
}
=======
}
>>>>>>> cbe533c (sharable link response metadata changed)
