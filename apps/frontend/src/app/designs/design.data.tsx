export type DesignType = {
  id: string;
  title: string;
  createdOn: string;
  type: string | "Certificate" | "Badge";
  imageUrl: string;
};

export const designs = [
  {
    id: "1",
    title: "Course Completion Certificate",
    createdOn: "12 Dec 2024",
    type: "Certificate",
    imageUrl: "https://dev-quick-certify.sfo3.cdn.digitaloceanspaces.com/organizations/r/avatar/H7COHto2giyXNx7J8Ak5m.png",
  },
  {
    id: "2",
    title: "Top Performer Badge",
    createdOn: "08 Dec 2024",
    type: "Badge",
    imageUrl: "https://dev-quick-certify.sfo3.cdn.digitaloceanspaces.com/organizations/r/avatar/H7COHto2giyXNx7J8Ak5m.png",
  },
];
