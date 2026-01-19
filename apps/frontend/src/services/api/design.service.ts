import { DesignPayload } from "@/types/design.types";

// export async function getDesign(id: string): Promise<Design> {
//   // replace with real API
//   return {
//     id,
//     name: "Certificate Design",
//     imageUrl: "/placeholder.png",
//   };
// }

export interface Design {
  id: string;
  uuid: string;
  design_type: 'badge' | 'certificate',
  desgin_url: string,
  createdAt: string;
  updatedAt: string;

}

export async function createDesign(payload: DesignPayload) {
  console.log("CREATE DESIGN", payload);
}

export async function updateDesign(
  id: string,
  payload: DesignPayload
) {
  console.log("UPDATE DESIGN", id, payload);
}
