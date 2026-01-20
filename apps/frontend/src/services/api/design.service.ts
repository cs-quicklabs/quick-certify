export type Design = {
  id: string;
  name: string;
  type: 'certificate' | 'badge';
  imageUrl: string;
};

export async function getDesignById(id: string): Promise<Design> {
  // Replace with real DB / API call
  return {
    id,
    name: 'Course Completion Certificate',
    type: 'certificate',
    imageUrl:
      'https://dev-quick-certify.sfo3.cdn.digitaloceanspaces.com/organizations/r/avatar/H7COHto2giyXNx7J8Ak5m.png',
  };
}
