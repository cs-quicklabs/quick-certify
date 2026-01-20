export type DesignType = {
  id: string;
  title: string;
  createdOn: string;
  type: string | "Certificate" | "Badge";
  thumbnail: string;
};

export const designs = [
  {
    id: "1",
    title: "Course Completion Certificate",
    createdOn: "12 Dec 2024",
    type: "Certificate",
    thumbnail: "https://dev.quick-certify.sfo3.digitaloceanspaces.com/organizations/r/avatar/WE7o9qv0SOFQ65ab0OZv3.png",
  },
  {
    id: "2",
    title: "Top Performer Badge",
    createdOn: "08 Dec 2024",
    type: "Badge",
    thumbnail: "https://dev.quick-certify.sfo3.digitaloceanspaces.com/organizations/r/avatar/WE7o9qv0SOFQ65ab0OZv3.png",
  },
];
