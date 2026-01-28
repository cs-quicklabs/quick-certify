export type Design = {
  id: string;
  name: string;
  imageUrl: string;
};

export type DesignType = 'certificate' | 'badge';

export interface DesignLayout {
  placeholders: Array<{
    id: string;
    type: 'text';
    key: 'recipient.name' | 'recipient.email';
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fontWeight?: string;
    color: string;
    align?: 'left' | 'center' | 'right';
  }>;
}
