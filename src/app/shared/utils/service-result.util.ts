export type ServiceError<TCode extends string> = {
  code: TCode;
  message: string;
};

export type ServiceResult<TData, TCode extends string> = {
  data: TData;
  error: ServiceError<TCode> | null;
};
