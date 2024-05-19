export interface ISharableLinkSlot {
  startDate: Date;
  endDate: Date;
}

export interface IPaginate {
  limit: number;
  offset: number;
}

export interface ISlotMetadata {
  note: string;
  email: string;
  name: string;
  phoneNumber: string;
}
