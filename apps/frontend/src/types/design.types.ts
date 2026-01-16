export type Design = {
  id: string;
  name: string;
  imageUrl: string;
};

export type DesignPayload = {
  name: string;
  image: File | null;
};
